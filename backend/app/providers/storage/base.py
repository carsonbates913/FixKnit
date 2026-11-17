from typing import Protocol


class MediaStore(Protocol):
    """Stores image bytes under a path. Raises ProviderError on failure."""

    async def put(self, path: str, data: bytes, content_type: str) -> None: ...

    async def get(self, path: str) -> bytes: ...

    def public_url(self, path: str) -> str:
        """The URL clients load the object from. Computed per response, never stored."""
        ...

    async def delete(self, paths: list[str]) -> None: ...

    async def aclose(self) -> None: ...
