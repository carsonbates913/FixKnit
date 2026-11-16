from fastapi.testclient import TestClient

from app.domain.guides import all_guides
from app.domain.taxonomy import Material


def test_every_material_has_a_guide() -> None:
    assert set(all_guides()) == set(Material)


def test_read_guide(client: TestClient) -> None:
    body = client.get("/api/guides/leather").json()
    assert body["material"] == "leather"
    assert len(body["links"]) == 3


def test_unknown_material_is_rejected(client: TestClient) -> None:
    assert client.get("/api/guides/kevlar").status_code == 422
