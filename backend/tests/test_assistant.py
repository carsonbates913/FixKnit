import json
from collections.abc import Callable
from typing import Any

import httpx2
import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.providers.advisor import ChatTurn, ProjectBrief
from app.providers.advisor.claude import ClaudeRepairAdvisor
from app.providers.errors import ProviderError
from app.schemas.diagnosis import ChatRole, Outcome
from tests.conftest import Auth, make_image, onboard

OPTION = {
    "title": "Woven darn",
    "summary": "Rebuild the fabric with matching yarn.",
    "technique": None,
    "visibility": "invisible",
    "difficulty": 2,
    "minutes": 40,
    "materials": ["Darning needle", "Wool yarn"],
    "steps": ["Stabilise the hole.", "Lay warp threads.", "Weave across.", "Weave in ends."],
}
DIAGNOSIS = {
    "outcome": "repairable",
    "garment": "sweater",
    "garment_confidence": 0.9,
    "material": "wool",
    "material_confidence": 0.8,
    "damages": [{"kind": "hole", "location": "left elbow", "size_cm": 2, "severity": "moderate"}],
    "options": [OPTION, {**OPTION, "title": "Elbow patch", "visibility": "visible"}],
    "notes": "",
}


def _message(*content: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": "msg_1",
        "type": "message",
        "role": "assistant",
        "model": "test-model",
        "content": list(content),
        "stop_reason": "end_turn",
        "stop_sequence": None,
        "usage": {"input_tokens": 1, "output_tokens": 1},
    }


def _tool_use(payload: Any) -> dict[str, Any]:
    return {"type": "tool_use", "id": "tu_1", "name": "report_diagnosis", "input": payload}


def _advisor(
    respond: Callable[[httpx2.Request], httpx2.Response],
    seen: list[httpx2.Request] | None = None,
    base_url: str | None = None,
) -> ClaudeRepairAdvisor:
    def handler(request: httpx2.Request) -> httpx2.Response:
        if seen is not None:
            seen.append(request)
        return respond(request)

    client = httpx2.AsyncClient(transport=httpx2.MockTransport(handler))
    return ClaudeRepairAdvisor("sk-test", "test-model", base_url=base_url, http_client=client)


def _ok(body: dict[str, Any]) -> Callable[[httpx2.Request], httpx2.Response]:
    return lambda _: httpx2.Response(200, json=body)


# --- Claude advisor ---------------------------------------------------------------------------


async def test_claude_diagnosis_parses_forced_tool_call() -> None:
    seen: list[httpx2.Request] = []
    advisor = _advisor(_ok(_message(_tool_use(DIAGNOSIS))), seen)

    result = await advisor.diagnose(make_image("JPEG"))

    assert result.outcome == Outcome.REPAIRABLE
    assert [o.id for o in result.options] == ["option-1", "option-2"]
    sent = json.loads(seen[0].content)
    assert sent["model"] == "test-model"
    assert sent["tool_choice"] == {"type": "tool", "name": "report_diagnosis"}
    assert "$ref" not in json.dumps(sent["tools"])
    assert sent["messages"][0]["content"][0]["source"]["media_type"] == "image/jpeg"


async def test_claude_non_repairable_outcome_drops_options() -> None:
    payload = {**DIAGNOSIS, "outcome": "not_garment", "notes": "That looks like a cat."}
    result = await _advisor(_ok(_message(_tool_use(payload)))).diagnose(b"img")
    assert result.outcome == Outcome.NOT_GARMENT
    assert result.options == [] and result.damages == []
    assert result.notes == "That looks like a cat."


async def test_claude_repairable_without_options_becomes_unclear() -> None:
    payload = {**DIAGNOSIS, "options": []}
    result = await _advisor(_ok(_message(_tool_use(payload)))).diagnose(b"img")
    assert result.outcome == Outcome.UNCLEAR
    assert result.notes


@pytest.mark.parametrize(
    "content",
    [
        {"type": "text", "text": "I can't help with that."},
        _tool_use({**DIAGNOSIS, "garment": "spaceship"}),
        _tool_use("not an object"),
    ],
)
async def test_claude_unusable_answers_raise_provider_error(content: dict[str, Any]) -> None:
    with pytest.raises(ProviderError, match="couldn’t read that photo"):
        await _advisor(_ok(_message(content))).diagnose(b"img")


async def test_claude_api_errors_are_sanitised() -> None:
    advisor = _advisor(
        lambda _: httpx2.Response(
            401, json={"type": "error", "error": {"type": "authentication_error", "message": "x"}}
        )
    )
    with pytest.raises(ProviderError) as exc:
        await advisor.diagnose(b"img")
    assert "sk-test" not in str(exc.value)
    assert "unavailable" in str(exc.value)


async def test_gateway_gets_bearer_token() -> None:
    seen: list[httpx2.Request] = []
    advisor = _advisor(
        _ok(_message(_tool_use(DIAGNOSIS))), seen, base_url="https://chat.example.edu/api"
    )
    await advisor.diagnose(b"img")
    assert str(seen[0].url) == "https://chat.example.edu/api/v1/messages"
    assert seen[0].headers["authorization"] == "Bearer sk-test"


async def test_claude_reply_sends_history_and_photos_with_latest_question() -> None:
    seen: list[httpx2.Request] = []
    advisor = _advisor(_ok(_message({"type": "text", "text": "Use grey, it blends."})), seen)
    history = [
        ChatTurn(ChatRole.USER, "How long will it take?"),
        ChatTurn(ChatRole.ASSISTANT, "About 40 minutes."),
        ChatTurn(ChatRole.USER, "I only have grey yarn. OK?"),
    ]

    answer = await advisor.reply(ProjectBrief("Title: Elbow", photos=[b"a", b"b"]), history)

    assert answer == "Use grey, it blends."
    sent = json.loads(seen[0].content)
    assert "Title: Elbow" in sent["system"]
    assert [m["role"] for m in sent["messages"]] == ["user", "assistant", "user"]
    assert sent["messages"][0]["content"] == "How long will it take?"
    last = sent["messages"][-1]["content"]
    assert [b["type"] for b in last] == ["image", "image", "text"]
    assert last[-1]["text"] == "I only have grey yarn. OK?"


def test_claude_provider_requires_a_key() -> None:
    with pytest.raises(ValueError, match="ANTHROPIC_API_KEY"):
        ClaudeRepairAdvisor("", "test-model")


# --- API --------------------------------------------------------------------------------------


def _start_project(client: TestClient) -> dict[str, Any]:
    d = client.post("/api/diagnoses", files={"file": ("g.png", make_image(), "image/png")}).json()
    r = client.post(
        "/api/projects", json={"diagnosis_id": d["id"], "option_id": d["options"][0]["id"]}
    )
    assert r.status_code == 201, r.text
    project: dict[str, Any] = r.json()
    return project


def test_diagnosis_reports_outcome(client: TestClient, auth: Auth) -> None:
    onboard(client, auth)
    r = client.post("/api/diagnoses", files={"file": ("g.png", make_image(), "image/png")})
    assert r.json()["outcome"] == "repairable"


def test_project_chat_round_trip(client: TestClient, auth: Auth) -> None:
    onboard(client, auth)
    project = _start_project(client)
    url = f"/api/projects/{project['id']}/messages"
    assert client.get(url).json() == []

    r = client.post(url, json={"body": "  Can I use grey yarn?  "})
    assert r.status_code == 201, r.text
    assert [(m["role"], m["body"][:10]) for m in r.json()] == [
        ("user", "Can I use "),
        ("assistant", "Demo reply"),
    ]
    client.post(url, json={"body": "Thanks!"})

    roles = [m["role"] for m in client.get(url).json()]
    assert roles == ["user", "assistant", "user", "assistant"]
    assert client.post(url, json={"body": ""}).status_code == 422


def test_project_chat_is_private(client: TestClient, auth: Auth) -> None:
    onboard(client, auth, "owner")
    project = _start_project(client)
    onboard(client, auth, "other")
    url = f"/api/projects/{project['id']}/messages"
    assert client.get(url).status_code == 404
    assert client.post(url, json={"body": "hi"}).status_code == 404


@pytest.fixture
def stingy_settings(settings: Settings) -> Settings:
    return settings.model_copy(update={"diagnoses_per_hour": 1, "chat_messages_per_hour": 1})


def test_hourly_limits(stingy_settings: Settings, auth: Auth) -> None:
    from app.auth import get_current_user
    from app.main import create_app

    app = create_app(stingy_settings)
    app.dependency_overrides[get_current_user] = lambda: auth.user
    with TestClient(app) as client:
        onboard(client, auth)
        project = _start_project(client)
        again = client.post("/api/diagnoses", files={"file": ("g.png", make_image(), "image/png")})
        assert again.status_code == 429
        assert "limit" in again.json()["detail"]

        url = f"/api/projects/{project['id']}/messages"
        assert client.post(url, json={"body": "one"}).status_code == 201
        assert client.post(url, json={"body": "two"}).status_code == 429
        assert len(client.get(url).json()) == 2


def test_project_brief_describes_plan_and_photos(client: TestClient, auth: Auth) -> None:
    from sqlalchemy.ext.asyncio import async_sessionmaker

    from app.models import Project
    from app.services.assistant import project_brief

    onboard(client, auth)
    project = _start_project(client)
    client.patch(f"/api/projects/{project['id']}", json={"steps_done": [0]})
    app = client.app

    async def build() -> ProjectBrief:
        maker: async_sessionmaker[Any] = app.state.sessionmaker  # type: ignore[attr-defined]
        async with maker() as session:
            p = await session.get(Project, project["id"])
            return await project_brief(session, p, app.state.media_store)  # type: ignore[attr-defined]

    assert client.portal is not None  # the app's own event loop, where its DB pool lives
    brief = client.portal.call(build)
    assert project["title"] in brief.summary
    assert "1. [done]" in brief.summary and "2. [to do]" in brief.summary
    assert "Damage:" in brief.summary
    assert len(brief.photos) == 1
