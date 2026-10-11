import asyncio

import httpx
import pytest

from legion.jsonutil import extract_json
from legion.models import Task
from legion.planner import PlanError, topo_waves, validate_tasks
from legion.providers import (AnthropicProvider, Budget, BudgetExceeded, OpenAICompatProvider, ProviderError,
                              complete_json, make_provider)
from legion.scheduler import Fleet, batches, estimate_calls, resolve_agent_count
from legion.tester import extract_files, master_test, scan_placeholders

from conftest import BROKEN_CODE, GOOD_CODE


# ---------------------------------------------------------------- json
def test_extract_json_variants():
    assert extract_json('{"a": 1}') == {"a": 1}
    assert extract_json('text\n```json\n{"a": 2}\n```\nmore') == {"a": 2}
    assert extract_json('Sure! {"a": 3} hope that helps') == {"a": 3}
    with pytest.raises(ValueError):
        extract_json("no json here")


# ------------------------------------------------------------- planner
def _t(i, deps=(), w=1):
    return {"id": i, "title": i, "instructions": f"do {i}", "depends_on": list(deps), "weight": w}


def test_waves_respect_dependencies():
    tasks = validate_tasks([_t("a"), _t("b"), _t("c", ["a", "b"]), _t("d", ["c"])])
    assert [[t.id for t in w] for w in topo_waves(tasks)] == [["a", "b"], ["c"], ["d"]]


@pytest.mark.parametrize("raw,msg", [
    ([_t("a", ["b"]), _t("b", ["a"])], "cycle"),
    ([_t("a"), _t("a")], "duplicate"),
    ([_t("a", ["zzz"])], "unknown task"),
    ([], "non-empty"),
    ([{"id": "a", "title": "a", "instructions": "x", "kind": "poem"}], "unknown kind"),
])
def test_plan_validation_rejects_bad_plans(raw, msg):
    with pytest.raises(PlanError, match=msg):
        validate_tasks(raw)


def test_plan_limit():
    with pytest.raises(PlanError, match="limit"):
        validate_tasks([_t(f"t{i}") for i in range(5)], max_tasks=4)


# ----------------------------------------------------------- scheduler
@pytest.mark.parametrize("req,n,expected", [("auto", 39295, 39295), ("1,000,000", 5, 1_000_000),
                                            (678, 10, 678), ("026363738", 1, 10_000_000)])
def test_resolve_agent_count(req, n, expected):
    assert resolve_agent_count(req, n) == expected


def test_even_distribution_678_agents_39295_tasks():
    tasks = [Task(f"t{i}", "x", "y") for i in range(39295)]
    fleet = Fleet(678, len(tasks))
    fleet.assign(tasks)
    s = fleet.stats()
    assert s["agents_with_work"] == 678
    assert s["max_tasks_per_agent"] - s["min_tasks_per_agent"] <= 1          # 57 or 58 each


def test_million_agents_each_get_at_most_one_task():
    tasks = [Task(f"t{i}", "x", "y") for i in range(2728)]
    fleet = Fleet(1_000_000, len(tasks))
    assignment = fleet.assign(tasks)
    assert len(set(assignment.values())) == 2728
    s = fleet.stats()
    assert s["max_tasks_per_agent"] == 1 and s["agents_idle"] == 1_000_000 - 2728


def test_weighted_balancing_is_tight():
    import random
    rnd = random.Random(7)
    tasks = [Task(f"t{i}", "x", "y", weight=rnd.randint(1, 10)) for i in range(5000)]
    fleet = Fleet(39, len(tasks))
    fleet.assign(tasks)
    s = fleet.stats()
    assert s["max_load"] - s["min_load"] <= 10   # LPT keeps spread within one max-weight task


def test_batches_and_estimates():
    assert [len(b) for b in batches(list(range(10)), 4)] == [4, 4, 2]
    assert [len(b) for b in batches(list(range(5456)), 2728)] == [2728, 2728]
    assert estimate_calls(10, 3, 3, 2, 1) == (70, 10 * 2 * (3 * 4 + 3))


# -------------------------------------------------------------- tester
def test_placeholder_scan():
    assert scan_placeholders("All done. Final answer is 42.") == []
    found = scan_placeholders("Intro\nTODO: write this\n[Insert chart here]\n...\nlorem ipsum")
    labels = " ".join(found)
    for label in ("TODO", "insert", "ellipsis", "lorem"):
        assert label.lower() in labels.lower()
    assert scan_placeholders('<input placeholder="Email">') == []


def test_master_tester_runs_real_tests():
    ok = master_test("code", GOOD_CODE)
    assert ok.passed and ok.executed, ok.issues
    bad = master_test("code", BROKEN_CODE)
    assert not bad.passed and "tests failed" in bad.issues[0]


def test_master_tester_rejections():
    no_tests = "### FILE: m.py\n```python\nX = 1\n```\n"
    assert "no tests" in master_test("code", no_tests).issues[0]
    unsafe = "### FILE: ../evil.py\n```python\nX = 1\n```\n"
    assert "unsafe" in master_test("code", unsafe).issues[0]
    syntax = "### FILE: m.py\n```python\ndef f(:\n```\n### FILE: test_m.py\n```python\nimport m\n```\n"
    assert any("syntax error" in i for i in master_test("code", syntax).issues)
    assert not master_test("code", "just prose").passed
    static = master_test("code", GOOD_CODE, allow_exec=False)
    assert static.passed and not static.executed
    assert set(extract_files(GOOD_CODE)) == {"mathx.py", "test_mathx.py"}


def test_master_tester_custom_command():
    out = "### FILE: hello.sh\n```bash\necho hi\n```\n"
    assert master_test("code", out, test_command="sh hello.sh").passed
    assert not master_test("code", out, test_command="sh hello.sh && exit 4").passed


# ----------------------------------------------------------- providers
def _anthropic(handler, **kw):
    return AnthropicProvider("claude-test", api_key="k", transport=httpx.MockTransport(handler), **kw)


def test_anthropic_retries_429_then_succeeds():
    calls = []

    def handler(request: httpx.Request):
        calls.append(request)
        if len(calls) < 3:
            return httpx.Response(429, headers={"retry-after": "0"}, json={"error": "slow down"})
        body = request.read()
        assert b'"model": "claude-test"' in body or b'"model":"claude-test"' in body
        return httpx.Response(200, json={"content": [{"type": "text", "text": "hello"}],
                                         "usage": {"input_tokens": 5, "output_tokens": 2}})

    async def go():
        p = _anthropic(handler)
        try:
            return await p.complete("sys", "hi"), p
        finally:
            await p.aclose()

    text, p = asyncio.run(go())
    assert text == "hello" and len(calls) == 3
    assert calls[0].headers["x-api-key"] == "k" and calls[0].headers["anthropic-version"] == "2023-06-01"
    assert p.usage == {"calls": 3, "retries": 2, "input_tokens": 5, "output_tokens": 2}


def test_anthropic_hard_error_and_budget():
    async def go_bad():
        p = _anthropic(lambda r: httpx.Response(400, json={"error": "bad"}))
        try:
            await p.complete("s", "p")
        finally:
            await p.aclose()

    with pytest.raises(ProviderError, match="HTTP 400"):
        asyncio.run(go_bad())

    async def go_budget():
        ok = lambda r: httpx.Response(200, json={"content": [{"type": "text", "text": "x"}]})
        p = _anthropic(ok, budget=Budget(2))
        try:
            await p.complete("s", "p")
            await p.complete("s", "p")
            await p.complete("s", "p")
        finally:
            await p.aclose()

    with pytest.raises(BudgetExceeded):
        asyncio.run(go_budget())


def test_openai_compat_and_json_repair():
    replies = iter(["not json at all", '{"verdict": "APPROVE", "issues": []}'])

    def handler(request):
        assert request.url.path.endswith("/chat/completions")
        return httpx.Response(200, json={"choices": [{"message": {"content": next(replies)}}],
                                         "usage": {"prompt_tokens": 1, "completion_tokens": 1}})

    async def go():
        p = OpenAICompatProvider("m", api_key="k", base_url="http://x/v1", transport=httpx.MockTransport(handler))
        try:
            return await complete_json(p, "s", "p")
        finally:
            await p.aclose()

    assert asyncio.run(go()) == {"verdict": "APPROVE", "issues": []}


def test_make_provider(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    monkeypatch.setenv("GEMINI_API_KEY", "g")
    assert make_provider("anthropic/claude-sonnet-5-5").spec == "anthropic/claude-sonnet-5-5"
    assert make_provider("gemini/gemini-2.5-pro").base_url.startswith("https://generativelanguage")
    assert make_provider("ollama/llama3.1").name == "ollama"
    assert make_provider("compat/http://localhost:8000/v1|qwen").model == "qwen"
    with pytest.raises(ProviderError):
        make_provider("nope/x")
    monkeypatch.delenv("ANTHROPIC_API_KEY")
    with pytest.raises(ProviderError, match="ANTHROPIC_API_KEY"):
        make_provider("anthropic/x")


def test_retries_are_charged_to_budget_and_limiter():
    attempts = []

    def throttled(request):
        attempts.append(1)
        return httpx.Response(429, headers={"retry-after": "0"}, json={"error": "slow down"})

    async def go():
        p = _anthropic(throttled, budget=Budget(3), max_retries=6)
        try:
            await p.complete("s", "p")
        finally:
            await p.aclose()

    with pytest.raises(BudgetExceeded):
        asyncio.run(go())
    assert len(attempts) == 3          # the budget of 3 stopped the 4th request, not 7 attempts

    class CountingLimiter:
        def __init__(self):
            self.n = 0

        async def acquire(self):
            self.n += 1

    replies = iter([httpx.Response(503, headers={"retry-after": "0"}), httpx.Response(503, headers={"retry-after": "0"}),
                    httpx.Response(200, json={"content": [{"type": "text", "text": "ok"}]})])

    async def go2():
        p = _anthropic(lambda r: next(replies))
        p._limiter = CountingLimiter()
        try:
            return await p.complete("s", "p"), p._limiter.n, p.budget.calls
        finally:
            await p.aclose()

    assert asyncio.run(go2()) == ("ok", 3, 3)


def test_child_processes_never_see_credentials(monkeypatch):
    from legion.sandbox import is_credential, sanitized_env
    for name in ("ANTHROPIC_API_KEY", "ANTHROPIC_BASE_URL", "OPENAI_API_KEY", "GEMINI_API_KEY", "GITHUB_TOKEN",
                 "ACTIONS_ID_TOKEN_REQUEST_TOKEN", "AWS_SECRET_ACCESS_KEY", "NPM_TOKEN", "STRIPE_API_KEY"):
        assert is_credential(name), name
    for name in ("PATH", "HOME", "DATABASE_URL", "SESSION_SECRET", "NODE_ENV", "CI"):
        assert not is_credential(name), name
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-secret")
    monkeypatch.setenv("GITHUB_TOKEN", "ghs_secret")
    monkeypatch.setenv("DATABASE_URL", "postgresql://db")
    monkeypatch.setenv("CUSTOM_API_KEY", "needed-by-tests")
    monkeypatch.setenv("LEGION_KEEP_ENV", "CUSTOM_API_KEY")
    env = sanitized_env()
    assert "ANTHROPIC_API_KEY" not in env and "GITHUB_TOKEN" not in env and "LEGION_KEEP_ENV" not in env
    assert env["DATABASE_URL"] == "postgresql://db" and env["CUSTOM_API_KEY"] == "needed-by-tests"

    # model-written code executed by the Master Tester cannot read the key from its environment
    probe = ("### FILE: test_env.py\n```python\nimport os\n\n\ndef test_no_key():\n"
             "    assert 'ANTHROPIC_API_KEY' not in os.environ\n    assert 'GITHUB_TOKEN' not in os.environ\n"
             "    assert os.environ['DATABASE_URL'] == 'postgresql://db'\n```\n")
    report = master_test("code", probe)
    assert report.passed and report.executed, report.issues
