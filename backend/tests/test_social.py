from fastapi.testclient import TestClient

from tests.conftest import Auth, make_image, onboard, upload


def diagnose(client: TestClient) -> dict:  # type: ignore[type-arg]
    r = client.post("/api/diagnoses", files={"file": ("g.png", make_image(), "image/png")})
    assert r.status_code == 201, r.text
    return r.json()  # type: ignore[no-any-return]


def test_diagnosis_returns_options_and_stores_photo(client: TestClient, auth: Auth) -> None:
    onboard(client, auth)
    d = diagnose(client)
    assert d["options"] and d["damages"]
    assert d["photo_url"].startswith("memory://")
    assert client.get(f"/api/diagnoses/{d['id']}").status_code == 200


def test_diagnoses_are_private(client: TestClient, auth: Auth) -> None:
    onboard(client, auth, "owner")
    d = diagnose(client)
    onboard(client, auth, "other")
    assert client.get(f"/api/diagnoses/{d['id']}").status_code == 404


def test_project_lifecycle_to_published_post(client: TestClient, auth: Auth) -> None:
    onboard(client, auth)
    d = diagnose(client)
    option = d["options"][0]

    r = client.post("/api/projects", json={"diagnosis_id": d["id"], "option_id": option["id"]})
    assert r.status_code == 201
    project = r.json()
    assert project["status"] == "planning"
    assert project["plan"]["title"] == option["title"]
    assert project["before_photo"]["url"] == d["photo_url"]

    r = client.patch(f"/api/projects/{project['id']}", json={"steps_done": [0, 1, 99]})
    assert r.json()["steps_done"] == [0, 1]
    assert r.json()["status"] == "in_progress"

    r = client.post(f"/api/projects/{project['id']}/publish", json={})
    assert r.status_code == 422  # no finished photo yet

    r = client.post(
        f"/api/projects/{project['id']}/updates", json={"kind": "after", "note": "Done!"}
    )
    assert r.status_code == 422  # an 'after' update needs a photo

    after = upload(client, "blue")
    r = client.post(
        f"/api/projects/{project['id']}/updates",
        json={"kind": "after", "note": "Done!", "media_id": after},
    )
    assert r.json()["status"] == "done"

    r = client.post(
        f"/api/projects/{project['id']}/publish", json={"caption": "Saved my favourite sweater"}
    )
    assert r.status_code == 201
    post = r.json()
    assert [m["role"] for m in post["media"]] == ["before", "after"]
    assert post["caption"] == "Saved my favourite sweater"
    assert "visiblemending" in post["tags"]

    assert client.post(f"/api/projects/{project['id']}/publish", json={}).status_code == 409
    assert client.get(f"/api/projects/{project['id']}").json()["post_id"] == post["id"]


def test_project_rejects_unknown_option(client: TestClient, auth: Auth) -> None:
    onboard(client, auth)
    d = diagnose(client)
    r = client.post("/api/projects", json={"diagnosis_id": d["id"], "option_id": "nope"})
    assert r.status_code == 422


def test_projects_are_private(client: TestClient, auth: Auth) -> None:
    onboard(client, auth, "owner")
    d = diagnose(client)
    p = client.post(
        "/api/projects", json={"diagnosis_id": d["id"], "option_id": d["options"][0]["id"]}
    ).json()
    onboard(client, auth, "other")
    assert client.get(f"/api/projects/{p['id']}").status_code == 404
    assert client.patch(f"/api/projects/{p['id']}", json={"title": "mine now"}).status_code == 404
    assert client.get("/api/projects").json() == []


def test_post_creation_and_feed(client: TestClient, auth: Auth) -> None:
    onboard(client, auth, "crocheter")
    media = upload(client)
    r = client.post(
        "/api/posts",
        json={
            "caption": "Granny square cardigan",
            "technique": "crochet",
            "tags": ["#Crochet", "granny square", "crochet"],
            "media": [{"media_id": media}],
        },
    )
    assert r.status_code == 201, r.text
    assert r.json()["tags"] == ["crochet", "grannysquare"]

    auth.sign_out()  # the feed is public
    feed = client.get("/api/posts").json()
    assert [p["caption"] for p in feed["items"]] == ["Granny square cardigan"]
    assert feed["items"][0]["author"]["handle"] == "crocheter"
    assert client.get("/api/posts", params={"tag": "crochet"}).json()["items"]
    assert not client.get("/api/posts", params={"tag": "denim"}).json()["items"]
    assert client.get("/api/posts", params={"author": "crocheter"}).json()["items"]


def test_cannot_post_someone_elses_photo(client: TestClient, auth: Auth) -> None:
    onboard(client, auth, "owner")
    media = upload(client)
    onboard(client, auth, "thief")
    r = client.post("/api/posts", json={"media": [{"media_id": media}]})
    assert r.status_code == 422


def test_feed_pagination(client: TestClient, auth: Auth) -> None:
    onboard(client, auth)
    media = upload(client)
    for i in range(5):
        client.post("/api/posts", json={"caption": f"post {i}", "media": [{"media_id": media}]})
    first = client.get("/api/posts", params={"limit": 3}).json()
    assert [p["caption"] for p in first["items"]] == ["post 4", "post 3", "post 2"]
    second = client.get("/api/posts", params={"limit": 3, "cursor": first["next_cursor"]}).json()
    assert [p["caption"] for p in second["items"]] == ["post 1", "post 0"]
    assert second["next_cursor"] is None


def test_likes(client: TestClient, auth: Auth) -> None:
    onboard(client, auth, "author")
    post = client.post("/api/posts", json={"media": [{"media_id": upload(client)}]}).json()
    onboard(client, auth, "fan")
    for _ in range(2):  # liking twice is idempotent
        assert client.put(f"/api/posts/{post['id']}/like").status_code == 204
    body = client.get(f"/api/posts/{post['id']}").json()
    assert body["like_count"] == 1 and body["liked_by_me"] is True
    client.delete(f"/api/posts/{post['id']}/like")
    assert client.get(f"/api/posts/{post['id']}").json()["like_count"] == 0


def test_only_author_can_delete_post(client: TestClient, auth: Auth) -> None:
    author = onboard(client, auth, "author")
    post = client.post("/api/posts", json={"media": [{"media_id": upload(client)}]}).json()
    onboard(client, auth, "other")
    assert client.delete(f"/api/posts/{post['id']}").status_code == 404
    auth.sign_in(author.id)
    assert client.delete(f"/api/posts/{post['id']}").status_code == 204
    assert client.get(f"/api/posts/{post['id']}").status_code == 404


def test_delete_account_removes_everything(client: TestClient, auth: Auth) -> None:
    onboard(client, auth, "leaving")
    client.post("/api/posts", json={"media": [{"media_id": upload(client)}]})
    store = client.app.state.media_store  # type: ignore[attr-defined]
    assert store.objects
    assert client.delete("/api/me").status_code == 204
    assert not store.objects
    assert client.get("/api/me").json()["profile"] is None
    assert client.get("/api/posts").json()["items"] == []
