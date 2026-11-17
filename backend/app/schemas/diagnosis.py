"""The repair assistant's output: what's wrong with a garment and the ways to fix it."""

import uuid
from datetime import datetime
from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, Field

from app.domain.taxonomy import GarmentType, Material, Technique


class DamageKind(StrEnum):
    HOLE = "hole"
    TEAR = "tear"
    STAIN = "stain"
    PILLING = "pilling"
    FRAYING = "fraying"
    SPLIT_SEAM = "split_seam"
    SNAG = "snag"
    WORN_THIN = "worn_thin"


class Severity(StrEnum):
    MINOR = "minor"
    MODERATE = "moderate"
    SEVERE = "severe"


class Outcome(StrEnum):
    """Whether the photo shows something the assistant can plan a repair for."""

    REPAIRABLE = "repairable"
    NO_DAMAGE = "no_damage"
    NOT_GARMENT = "not_garment"
    UNCLEAR = "unclear"


class Damage(BaseModel):
    kind: DamageKind
    location: str
    size_cm: float | None = None
    severity: Severity


class RepairOption(BaseModel):
    id: str
    title: str
    summary: str
    technique: Technique | None = None
    visibility: Literal["invisible", "visible"]
    difficulty: Annotated[int, Field(ge=1, le=3)]
    minutes: Annotated[int, Field(ge=1)]
    materials: list[str]
    steps: list[str]


class DiagnosisResult(BaseModel):
    outcome: Outcome = Outcome.REPAIRABLE
    garment: GarmentType | None
    garment_confidence: Annotated[float, Field(ge=0, le=1)] = 0
    material: Material | None
    material_confidence: Annotated[float, Field(ge=0, le=1)] = 0
    damages: list[Damage]
    options: list[RepairOption]
    # Anything the user should know. When the outcome isn't repairable, what to photograph instead.
    notes: str = ""


class DiagnosisOut(DiagnosisResult):
    id: uuid.UUID
    photo_url: str
    created_at: datetime


class ChatRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessageIn(BaseModel):
    body: Annotated[str, Field(min_length=1, max_length=2000)]


class ChatMessageOut(BaseModel):
    id: uuid.UUID
    role: ChatRole
    body: str
    created_at: datetime
