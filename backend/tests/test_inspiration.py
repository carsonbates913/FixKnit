import httpx
import pytest
from fastapi.testclient import TestClient

from app.domain.search import build_inspiration_query
from app.domain.taxonomy import Color, Technique
from app.providers.errors import ProviderError
from app.providers.inspiration.google_cse import GoogleCustomSearchProvider


def test_query_defaults_to_embroidery() -> None:
    assert build_inspiration_query(" sweater ") == "embroidered sweater"


def test_query_includes_techniques_and_colors() -> None:
    query = build_inspiration_query("hat", [Technique.CROCHET], [Color.GREEN, Color.PINK])
    assert query == "crochet green pink hat"


def test_search_endpoint(client: TestClient) -> None:
    response = client.get(
        "/api/inspiration", params={"q": "sweater", "techniques": ["knitting"], "colors": "blue"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["query"] == "knitted blue sweater"
    assert len(body["images"]) == 8


def test_search_requires_query(client: TestClient) -> None:
    assert client.get("/api/inspiration", params={"q": ""}).status_code == 422


def cse(handler: httpx.MockTransport) -> GoogleCustomSearchProvider:
    return GoogleCustomSearchProvider(
        "secret-key", "cse", client=httpx.AsyncClient(transport=handler)
    )


async def test_cse_maps_items() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["q"] == "embroidered red sweater"
        return httpx.Response(
            200,
            json={
                "items": [
                    {
                        "link": "https://img/1.jpg",
                        "title": "One",
                        "image": {"thumbnailLink": "https://t/1", "contextLink": "https://p/1"},
                    },
                    {"title": "missing link is skipped"},
                ]
            },
        )

    images = await cse(httpx.MockTransport(handler)).search("embroidered red sweater")
    assert [(i.url, i.thumbnail_url, i.source_url) for i in images] == [
        ("https://img/1.jpg", "https://t/1", "https://p/1")
    ]


async def test_cse_error_does_not_leak_api_key() -> None:
    provider = cse(httpx.MockTransport(lambda _: httpx.Response(403, text="forbidden")))
    with pytest.raises(ProviderError) as info:
        await provider.search("x")
    assert "secret-key" not in str(info.value)
    assert "403" in str(info.value)
