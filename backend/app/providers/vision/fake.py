from app.schemas import Label

DEFAULT_LABELS = [
    Label(description="Sweater", score=0.95),
    Label(description="Wool", score=0.88),
    Label(description="Sleeve", score=0.84),
    Label(description="Knitting", score=0.71),
]


class FakeVisionProvider:
    """Returns canned labels; for tests and offline development."""

    def __init__(self, labels: list[Label] | None = None) -> None:
        self.labels = DEFAULT_LABELS if labels is None else labels

    async def label_image(self, image: bytes) -> list[Label]:
        return list(self.labels)

    async def aclose(self) -> None:
        pass
