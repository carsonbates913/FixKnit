"""Pydantic models that form the public API contract (and the generated frontend types)."""

from pydantic import BaseModel, Field

from app.domain.taxonomy import GarmentType, Material


class Label(BaseModel):
    """A raw label from the vision provider."""

    description: str
    score: float = Field(ge=0, le=1)


class GarmentDetection(BaseModel):
    garment: GarmentType
    confidence: float = Field(ge=0, le=1)


class MaterialDetection(BaseModel):
    material: Material
    confidence: float = Field(ge=0, le=1)


class RepairLink(BaseModel):
    title: str
    url: str


class RepairGuide(BaseModel):
    material: Material
    instructions: str
    links: list[RepairLink] = []


class AnalysisResult(BaseModel):
    garments: list[GarmentDetection]
    materials: list[MaterialDetection]
    repair_guides: list[RepairGuide]
    labels: list[Label]


class InspirationImage(BaseModel):
    url: str
    title: str
    thumbnail_url: str | None = None
    source_url: str | None = None


class InspirationResults(BaseModel):
    query: str
    images: list[InspirationImage]


class Health(BaseModel):
    status: str = "ok"
