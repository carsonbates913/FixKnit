import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_vision_provider
from app.config import Settings
from app.main import create_app
from app.providers.errors import ProviderError
from app.providers.vision.fake import FakeVisionProvider
from app.schemas import Label
from tests.conftest import make_image


def post_image(client: TestClient, data: bytes, content_type: str = "image/png"):  # type: ignore[no-untyped-def]
    return client.post("/api/analysis", files={"file": ("garment.png", data, content_type)})


def test_analyzes_garment_and_attaches_guides(client: TestClient) -> None:
    response = post_image(client, make_image())
    assert response.status_code == 200
    body = response.json()
    assert body["garments"][0]["garment"] == "sweater"
    assert [m["material"] for m in body["materials"]] == ["wool"]
    assert body["repair_guides"][0]["material"] == "wool"
    assert body["repair_guides"][0]["links"]


def test_no_matches_returns_empty_lists(client: TestClient) -> None:
    client.app.dependency_overrides[get_vision_provider] = lambda: FakeVisionProvider(  # type: ignore[attr-defined]
        [Label(description="Furniture", score=0.9)]
    )
    body = post_image(client, make_image()).json()
    assert body["garments"] == []
    assert body["materials"] == []
    assert body["repair_guides"] == []


def test_accepts_jpeg(client: TestClient) -> None:
    assert post_image(client, make_image("JPEG"), "image/jpeg").status_code == 200


def test_rejects_unsupported_type(client: TestClient) -> None:
    assert post_image(client, b"hello", "text/plain").status_code == 415


def test_rejects_corrupt_image(client: TestClient) -> None:
    assert post_image(client, b"not really a png").status_code == 422


def test_rejects_oversize_upload(settings: Settings) -> None:
    settings.max_upload_bytes = 100
    with TestClient(create_app(settings)) as client:
        assert post_image(client, make_image(size=(256, 256))).status_code == 413


def test_provider_failure_is_502(client: TestClient) -> None:
    class Failing(FakeVisionProvider):
        async def label_image(self, image: bytes) -> list[Label]:
            raise ProviderError("vision is down")

    client.app.dependency_overrides[get_vision_provider] = Failing  # type: ignore[attr-defined]
    response = post_image(client, make_image())
    assert response.status_code == 502
    assert response.json() == {"detail": "vision is down"}


@pytest.mark.parametrize("path", ["/api/health", "/openapi.json"])
def test_meta_endpoints(client: TestClient, path: str) -> None:
    assert client.get(path).status_code == 200
