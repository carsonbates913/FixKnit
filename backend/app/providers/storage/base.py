from typing import Protocol


class MediaStore(Protocol):
    """Stores image bytes and returns a public URL. Raises ProviderError on failure."""

    async def put(self, path: str, data: bytes, content_type: str) -> str: ...

    async def delete(self, paths: list[str]) -> None: ...

    async def aclose(self) -> None: ...
