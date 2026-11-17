from dataclasses import dataclass, field
from typing import Protocol

from app.schemas.diagnosis import ChatRole, DiagnosisResult


@dataclass(frozen=True)
class ChatTurn:
    role: ChatRole
    body: str


@dataclass(frozen=True)
class ProjectBrief:
    """What the assistant knows about a project when answering questions about it."""

    summary: str
    # JPEGs, oldest first: the "before" photo, then the latest progress or finished photo.
    photos: list[bytes] = field(default_factory=list)


class RepairAdvisor(Protocol):
    """Looks at garment photos, proposes ways to repair them and answers follow-up questions.

    Implementations raise ProviderError on failure.
    """

    async def diagnose(self, image: bytes) -> DiagnosisResult: ...

    async def reply(self, brief: ProjectBrief, history: list[ChatTurn]) -> str:
        """Answer the last user turn in `history`."""
        ...

    async def aclose(self) -> None: ...
