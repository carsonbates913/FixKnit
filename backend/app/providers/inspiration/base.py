from typing import Protocol

from app.schemas import InspirationImage


class InspirationProvider(Protocol):
    """Finds example images for a search query. Implementations raise ProviderError on failure."""

    async def search(self, query: str) -> list[InspirationImage]: ...

    async def aclose(self) -> None: ...
