from fastapi import APIRouter, UploadFile

from app.api.deps import SettingsDep, VisionDep
from app.domain.guides import get_guide
from app.domain.matching import match_labels
from app.domain.taxonomy import GARMENT_SYNONYMS, MATERIAL_SYNONYMS
from app.imaging import read_image_upload
from app.schemas import AnalysisResult, GarmentDetection, MaterialDetection

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("")
async def analyze_garment(
    file: UploadFile, settings: SettingsDep, vision: VisionDep
) -> AnalysisResult:
    """Identify the garment type and material in a photo and attach matching repair guides."""
    image = await read_image_upload(file, settings.max_upload_bytes, settings.max_image_dimension)
    labels = await vision.label_image(image.data)
    garments = match_labels(labels, GARMENT_SYNONYMS)
    materials = match_labels(labels, MATERIAL_SYNONYMS)

    return AnalysisResult(
        garments=[GarmentDetection(garment=g, confidence=c) for g, c in garments],
        materials=[MaterialDetection(material=m, confidence=c) for m, c in materials],
        repair_guides=[guide for m, _ in materials if (guide := get_guide(m)) is not None],
        labels=labels,
    )
