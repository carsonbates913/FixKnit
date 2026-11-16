class MemoryMediaStore:
    """Keeps uploads in memory; for tests."""

    def __init__(self) -> None:
        self.objects: dict[str, bytes] = {}

    async def put(self, path: str, data: bytes, content_type: str) -> str:
        self.objects[path] = data
        return f"memory://{path}"

    async def delete(self, paths: list[str]) -> None:
        for path in paths:
            self.objects.pop(path, None)

    async def aclose(self) -> None:
        pass
