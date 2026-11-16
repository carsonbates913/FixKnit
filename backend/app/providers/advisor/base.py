from typing import Protocol

from app.schemas.diagnosis import DiagnosisResult


class RepairAdvisor(Protocol):
    """Looks at a garment photo and proposes ways to repair it.

    Implementations raise ProviderError on failure. The AI-backed advisor plugs in here.
    """

    async def diagnose(self, image: bytes) -> DiagnosisResult: ...

    async def aclose(self) -> None: ...
