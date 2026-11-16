from fastapi.testclient import TestClient

from tests.conftest import Auth, onboard


def test_me_requires_sign_in(client: TestClient) -> None:
    assert client.get("/api/me").status_code == 401


def test_new_guest_has_no_profile(client: TestClient, auth: Auth) -> None:
    auth.sign_in()
    body = client.get("/api/me").json()
    assert body["is_guest"] is True
    assert body["profile"] is None


def test_onboarding_creates_profile(client: TestClient, auth: Auth) -> None:
    auth.sign_in()
    r = client.put(
        "/api/me/profile",
        json={"handle": "@Sam_Knits", "display_name": " Sam ", "techniques": ["crochet"]},
    )
    assert r.status_code == 200
    assert r.json()["handle"] == "sam_knits"
    assert r.json()["display_name"] == "Sam"
    assert client.get("/api/me").json()["profile"]["techniques"] == ["crochet"]
    assert client.get("/api/profiles/SAM_KNITS").json()["is_me"] is True


def test_handle_must_be_unique(client: TestClient, auth: Auth) -> None:
    onboard(client, auth, "taken")
    auth.sign_in()
    r = client.put("/api/me/profile", json={"handle": "taken", "display_name": "Other"})
    assert r.status_code == 409


def test_handle_validation(client: TestClient, auth: Auth) -> None:
    auth.sign_in()
    for bad in ["ab", "has space", "x" * 21, "émile"]:
        r = client.put("/api/me/profile", json={"handle": bad, "display_name": "X"})
        assert r.status_code == 422, bad


def test_writing_requires_a_profile(client: TestClient, auth: Auth) -> None:
    auth.sign_in()
    r = client.post("/api/posts", json={"caption": "hi", "media": []})
    assert r.status_code in (403, 422)
    r = client.post("/api/media", files={"file": ("p.png", b"x", "image/png")})
    assert r.status_code == 403


def test_unknown_profile_404(client: TestClient) -> None:
    assert client.get("/api/profiles/nobody").status_code == 404
