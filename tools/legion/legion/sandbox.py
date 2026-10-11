"""Environment hygiene for commands that may execute model-written code.

Legion deliberately runs code that models wrote (tests, evidence commands, workspace
setup, the integration gate). None of those processes needs the credentials Legion uses to
call model providers, or CI credentials, so they are removed from every child environment.

Removed:
  * every variable starting with ANTHROPIC_, OPENAI_, GEMINI_, OLLAMA_ or LEGION_COMPAT_
  * well-known CI/cloud credentials (GITHUB_TOKEN, GH_TOKEN, ACTIONS_* token endpoints, AWS keys)
  * any variable whose name ends in _API_KEY, _ACCESS_KEY, _ACCESS_KEY_ID, _AUTH_TOKEN or _TOKEN
Kept on request: names listed (comma-separated) in LEGION_KEEP_ENV.

Limit: this closes the inherited-environment path. Code running as the same OS user can
still read the parent process's /proc/<pid>/environ. For untrusted goals, run Legion in a
dedicated container or VM and give it a spend-limited key.
"""
from __future__ import annotations

import os
import re

PROVIDER_PREFIXES = ("ANTHROPIC_", "OPENAI_", "GEMINI_", "OLLAMA_", "LEGION_COMPAT_")
EXACT = {
    "GITHUB_TOKEN", "GH_TOKEN", "GH_ENTERPRISE_TOKEN",
    "ACTIONS_RUNTIME_TOKEN", "ACTIONS_RUNTIME_URL", "ACTIONS_CACHE_URL", "ACTIONS_RESULTS_URL",
    "ACTIONS_ID_TOKEN_REQUEST_TOKEN", "ACTIONS_ID_TOKEN_REQUEST_URL",
    "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN",
}
SUFFIX = re.compile(r"(_API_KEY|_ACCESS_KEY|_ACCESS_KEY_ID|_AUTH_TOKEN|_TOKEN)$")


def is_credential(name: str) -> bool:
    upper = name.upper()
    return upper.startswith(PROVIDER_PREFIXES) or upper in EXACT or bool(SUFFIX.search(upper))


def sanitized_env(extra: dict[str, str] | None = None) -> dict[str, str]:
    keep = {n.strip().upper() for n in os.environ.get("LEGION_KEEP_ENV", "").split(",") if n.strip()}
    env = {k: v for k, v in os.environ.items() if k.upper() in keep or not is_credential(k)}
    env.pop("LEGION_KEEP_ENV", None)
    if extra:
        env.update(extra)
    return env
