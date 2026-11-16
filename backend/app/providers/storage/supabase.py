import logging

import httpx

from app.providers.errors import ProviderError

logger = logging.getLogger(__name__)


class SupabaseMediaStore:
    """Supabase Storage, written with the project's secret key and read through public URLs."""

    def __init__(
        self, supabase_url: str, secret_key: str, bucket: str, public_url: str | None = None
    ) -> None:
        base = supabase_url.rstrip("/")
        self._bucket = bucket
        public = (public_url or supabase_url).rstrip("/")
        self._public_base = f"{public}/storage/v1/object/public/{bucket}"
        headers = {"apikey": secret_key}
        if not secret_key.startswith("sb_"):  # legacy service_role JWT
            headers["Authorization"] = f"Bearer {secret_key}"
        self._client = httpx.AsyncClient(
            base_url=f"{base}/storage/v1", headers=headers, timeout=20.0
        )

    async def put(self, path: str, data: bytes, content_type: str) -> str:
        response = await self._client.post(
            f"/object/{self._bucket}/{path}",
            content=data,
            headers={"Content-Type": content_type, "Cache-Control": "max-age=31536000"},
        )
        if response.is_error:
            logger.warning(
                "Storage upload failed %s: %s", response.status_code, response.text[:300]
            )
            raise ProviderError(f"Couldn't store the photo (HTTP {response.status_code})")
        return f"{self._public_base}/{path}"

    async def delete(self, paths: list[str]) -> None:
        if not paths:
            return
        response = await self._client.request(
            "DELETE", f"/object/{self._bucket}", json={"prefixes": paths}
        )
        if response.is_error:
            logger.warning(
                "Storage delete failed %s: %s", response.status_code, response.text[:300]
            )

    async def aclose(self) -> None:
        await self._client.aclose()
