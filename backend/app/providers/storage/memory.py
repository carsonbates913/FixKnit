from app.providers.errors import ProviderError


class MemoryMediaStore:
    """Keeps uploads in memory; for tests."""

    def __init__(self) -> None:
        self.objects: dict[str, bytes] = {}

    async def put(self, path: str, data: bytes, content_type: str) -> None:
        self.objects[path] = data

    async def get(self, path: str) -> bytes:
        try:
            return self.objects[path]
        except KeyError:
            raise ProviderError("Photo not found") from None

    def public_url(self, path: str) -> str:
        return f"memory://{path}"

    async def delete(self, paths: list[str]) -> None:
        for path in paths:
            self.objects.pop(path, None)

    async def aclose(self) -> None:
        pass
