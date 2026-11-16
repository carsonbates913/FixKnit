from app.schemas import InspirationImage


class FakeInspirationProvider:
    """Returns placeholder images; for tests and offline development."""

    def __init__(self, count: int = 8) -> None:
        self.count = count
        self.queries: list[str] = []

    async def search(self, query: str) -> list[InspirationImage]:
        self.queries.append(query)
        return [
            InspirationImage(
                url=f"https://picsum.photos/seed/fixknit-{i}/480/480",
                title=f"{query} #{i + 1}",
            )
            for i in range(self.count)
        ]

    async def aclose(self) -> None:
        pass
