"""Google Custom Search JSON API (image search).

Note: Google discontinues this API on 2027-01-01; swap in another InspirationProvider before then.
"""

import logging
from typing import Any

import httpx

from app.providers.errors import ProviderError
from app.schemas import InspirationImage

ENDPOINT = "https://www.googleapis.com/customsearch/v1"

logger = logging.getLogger(__name__)


class GoogleCustomSearchProvider:
    def __init__(self, api_key: str, cse_id: str, client: httpx.AsyncClient | None = None) -> None:
        self._api_key = api_key
        self._cse_id = cse_id
        self._client = client or httpx.AsyncClient(timeout=10.0)

    async def search(self, query: str) -> list[InspirationImage]:
        if not (self._api_key and self._cse_id):
            raise ProviderError("Custom Search is not configured (GOOGLE_API_KEY / GOOGLE_CSE_ID)")

        params = {"q": query, "cx": self._cse_id, "key": self._api_key, "searchType": "image"}
        # Error messages deliberately omit the request URL: it carries the API key.
        try:
            response = await self._client.get(ENDPOINT, params=params)
        except httpx.HTTPError as exc:
            raise ProviderError(f"Custom Search request failed ({type(exc).__name__})") from None
        if response.is_error:
            logger.warning("Custom Search HTTP %s: %s", response.status_code, response.text[:500])
            raise ProviderError(f"Custom Search returned HTTP {response.status_code}")

        items: list[dict[str, Any]] = response.json().get("items", [])
        return [
            InspirationImage(
                url=item["link"],
                title=item.get("title", ""),
                thumbnail_url=item.get("image", {}).get("thumbnailLink"),
                source_url=item.get("image", {}).get("contextLink"),
            )
            for item in items
            if "link" in item
        ]

    async def aclose(self) -> None:
        await self._client.aclose()
