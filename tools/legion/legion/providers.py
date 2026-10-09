"""Model providers: Anthropic (Claude), OpenAI, Gemini and any OpenAI-compatible
endpoint (Ollama, vLLM, LM Studio, OpenRouter...).

Every provider shares the same safety rails: a concurrency cap, an optional
requests-per-minute limiter, exponential backoff with Retry-After support, and a
global call budget so a "million agent" run can never silently overspend.
"""
from __future__ import annotations

import asyncio
import os
import random
import time
from typing import Callable

import httpx

from .jsonutil import extract_json


class ProviderError(RuntimeError):
    """Non-retryable provider failure (bad key, bad request, retries exhausted)."""


class BudgetExceeded(RuntimeError):
    """Raised when the run's hard call budget is used up."""


class _Retryable(Exception):
    def __init__(self, message: str, retry_after: float | None = None):
        super().__init__(message)
        self.retry_after = retry_after


class Budget:
    """Hard cap on total model calls across every provider in a run."""

    def __init__(self, max_calls: int | None = None):
        self.max_calls = max_calls
        self.calls = 0

    def take(self) -> None:
        if self.max_calls is not None and self.calls >= self.max_calls:
            raise BudgetExceeded(f"call budget of {self.max_calls} exhausted")
        self.calls += 1


class RateLimiter:
    """Token bucket limiting requests per minute (0 = unlimited)."""

    def __init__(self, rpm: int = 0):
        self.rpm = rpm
        self.tokens = float(rpm)
        self.last = time.monotonic()
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        if not self.rpm:
            return
        async with self._lock:
            while True:
                now = time.monotonic()
                self.tokens = min(self.rpm, self.tokens + (now - self.last) * self.rpm / 60.0)
                self.last = now
                if self.tokens >= 1:
                    self.tokens -= 1
                    return
                await asyncio.sleep((1 - self.tokens) * 60.0 / self.rpm)


RETRYABLE_STATUS = {408, 409, 425, 429, 500, 502, 503, 504, 529}


class Provider:
    name = "base"

    def __init__(
        self,
        model: str,
        *,
        max_concurrency: int = 16,
        rpm: int = 0,
        max_retries: int = 6,
        timeout: float = 600.0,
        budget: Budget | None = None,
        transport: httpx.AsyncBaseTransport | None = None,
    ):
        self.model = model
        self.max_retries = max_retries
        self.timeout = timeout
        self.budget = budget or Budget(None)
        self._sem = asyncio.Semaphore(max_concurrency)
        self._limiter = RateLimiter(rpm)
        self._transport = transport
        self._client: httpx.AsyncClient | None = None
        self.usage = {"calls": 0, "input_tokens": 0, "output_tokens": 0}

    @property
    def spec(self) -> str:
        return f"{self.name}/{self.model}"

    def _http(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=self.timeout, transport=self._transport)
        return self._client

    async def aclose(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def complete(self, system: str, prompt: str, max_tokens: int = 8192) -> str:
        """Every outbound request, retries included, is charged to the call budget and the
        rate limiter, so --budget-calls and --rpm hold even under provider throttling.
        usage["calls"] counts requests sent; usage["retries"] the ones that were retried."""
        for attempt in range(self.max_retries + 1):
            self.budget.take()
            await self._limiter.acquire()
            async with self._sem:
                self.usage["calls"] += 1
                try:
                    return await self._call(system, prompt, max_tokens)
                except _Retryable as exc:
                    if attempt >= self.max_retries:
                        raise ProviderError(f"{self.spec}: retries exhausted: {exc}") from exc
                    self.usage["retries"] = self.usage.get("retries", 0) + 1
                    delay = exc.retry_after if exc.retry_after is not None else min(60.0, 2 ** attempt)
            await asyncio.sleep(delay + random.uniform(0, 0.5))  # back off without holding a slot
        raise ProviderError("unreachable")

    async def _call(self, system: str, prompt: str, max_tokens: int) -> str:  # pragma: no cover
        raise NotImplementedError("Provider subclasses implement _call")

    async def _post(self, url: str, headers: dict, body: dict) -> dict:
        try:
            resp = await self._http().post(url, headers=headers, json=body)
        except httpx.TransportError as exc:
            raise _Retryable(f"transport error: {exc!r}") from exc
        if resp.status_code in RETRYABLE_STATUS:
            ra = resp.headers.get("retry-after")
            try:
                retry_after = float(ra) if ra is not None else None
            except ValueError:
                retry_after = None
            raise _Retryable(f"HTTP {resp.status_code}: {resp.text[:300]}", retry_after)
        if resp.status_code >= 400:
            raise ProviderError(f"{self.spec}: HTTP {resp.status_code}: {resp.text[:1000]}")
        return resp.json()


class AnthropicProvider(Provider):
    name = "anthropic"

    def __init__(self, model: str, api_key: str | None = None, base_url: str | None = None, **kw):
        super().__init__(model, **kw)
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        self.base_url = (base_url or os.environ.get("ANTHROPIC_BASE_URL") or "https://api.anthropic.com").rstrip("/")
        if not self.api_key:
            raise ProviderError("ANTHROPIC_API_KEY is not set")

    async def _call(self, system: str, prompt: str, max_tokens: int) -> str:
        data = await self._post(
            f"{self.base_url}/v1/messages",
            {
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            {
                "model": self.model,
                "max_tokens": max_tokens,
                "system": system,
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        usage = data.get("usage") or {}
        self.usage["input_tokens"] += int(usage.get("input_tokens", 0))
        self.usage["output_tokens"] += int(usage.get("output_tokens", 0))
        parts = [b.get("text", "") for b in data.get("content", []) if b.get("type") == "text"]
        text = "".join(parts)
        if not text.strip():
            raise _Retryable(f"empty completion (stop_reason={data.get('stop_reason')})")
        return text


class OpenAICompatProvider(Provider):
    name = "openai"

    def __init__(self, model: str, api_key: str | None = None, base_url: str = "https://api.openai.com/v1",
                 key_env: str = "OPENAI_API_KEY", key_required: bool = True, label: str = "openai", **kw):
        super().__init__(model, **kw)
        self.name = label
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or os.environ.get(key_env)
        if key_required and not self.api_key:
            raise ProviderError(f"{key_env} is not set")

    async def _call(self, system: str, prompt: str, max_tokens: int) -> str:
        headers = {"content-type": "application/json"}
        if self.api_key:
            headers["authorization"] = f"Bearer {self.api_key}"
        data = await self._post(
            f"{self.base_url}/chat/completions",
            headers,
            {
                "model": self.model,
                "max_tokens": max_tokens,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
            },
        )
        usage = data.get("usage") or {}
        self.usage["input_tokens"] += int(usage.get("prompt_tokens", 0))
        self.usage["output_tokens"] += int(usage.get("completion_tokens", 0))
        choices = data.get("choices") or []
        text = (choices[0].get("message", {}).get("content") or "") if choices else ""
        if not text.strip():
            raise _Retryable("empty completion")
        return text


def make_provider(spec: str, **kw) -> Provider:
    """Build a provider from 'family/model', e.g. 'anthropic/claude-sonnet-5-5',
    'openai/gpt-5', 'gemini/gemini-2.5-pro', 'ollama/llama3.1',
    'compat/<base_url>|<model>' (key from LEGION_COMPAT_API_KEY, optional)."""
    family, _, model = spec.partition("/")
    family = family.lower()
    if not model:
        raise ProviderError(f"bad provider spec {spec!r}; expected family/model")
    if family in ("anthropic", "claude"):
        return AnthropicProvider(model, **kw)
    if family == "openai":
        return OpenAICompatProvider(model, base_url=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1"), **kw)
    if family == "gemini":
        return OpenAICompatProvider(model, base_url="https://generativelanguage.googleapis.com/v1beta/openai",
                                    key_env="GEMINI_API_KEY", label="gemini", **kw)
    if family == "ollama":
        return OpenAICompatProvider(model, base_url=os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
                                    key_env="OLLAMA_API_KEY", key_required=False, label="ollama", **kw)
    if family == "compat":
        base, sep, real_model = model.partition("|")
        if not sep:
            raise ProviderError("compat spec must be compat/<base_url>|<model>")
        return OpenAICompatProvider(real_model, base_url=base, key_env="LEGION_COMPAT_API_KEY",
                                    key_required=False, label="compat", **kw)
    raise ProviderError(f"unknown provider family {family!r}")


async def complete_json(
    provider: Provider,
    system: str,
    prompt: str,
    validate: Callable[[object], object] | None = None,
    repairs: int = 2,
    max_tokens: int = 8192,
):
    """Ask for JSON, parse it, validate it; re-ask with the error on failure."""
    reply = await provider.complete(system, prompt, max_tokens)
    last_error = ""
    for attempt in range(repairs + 1):
        try:
            value = extract_json(reply)
            return validate(value) if validate else value
        except (ValueError, KeyError, TypeError) as exc:
            last_error = str(exc)
            if attempt == repairs:
                break
            reply = await provider.complete(
                system,
                prompt
                + "\n\nYour previous reply was rejected: "
                + last_error
                + "\nPrevious reply (truncated):\n"
                + reply[:4000]
                + "\n\nReply again with ONLY the corrected JSON.",
                max_tokens,
            )
    raise ProviderError(f"{provider.spec}: could not get valid JSON: {last_error}")
