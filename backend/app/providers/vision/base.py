from typing import Protocol

from app.schemas import Label


class VisionProvider(Protocol):
    """Turns an image into descriptive labels. Implementations raise ProviderError on failure."""

    async def label_image(self, image: bytes) -> list[Label]: ...

    async def aclose(self) -> None: ...
