from fastapi import APIRouter, HTTPException, UploadFile, status
from starlette.concurrency import run_in_threadpool

from app.api.deps import SettingsDep, VisionDep
from app.domain.guides import get_guide
from app.domain.matching import match_labels
from app.domain.taxonomy import GARMENT_SYNONYMS, MATERIAL_SYNONYMS
from app.imaging import ALLOWED_CONTENT_TYPES, InvalidImageError, normalize_image
from app.schemas import AnalysisResult, GarmentDetection, MaterialDetection

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("")
async def analyze_garment(
    file: UploadFile, settings: SettingsDep, vision: VisionDep
) -> AnalysisResult:
    """Identify the garment type and material in a photo and attach matching repair guides."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type; use one of {sorted(ALLOWED_CONTENT_TYPES)}",
        )

    data = await file.read(settings.max_upload_bytes + 1)
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Image exceeds {settings.max_upload_bytes // (1024 * 1024)} MB",
        )

    try:
        image = await run_in_threadpool(normalize_image, data, settings.max_image_dimension)
    except InvalidImageError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)) from exc

    labels = await vision.label_image(image)
    garments = match_labels(labels, GARMENT_SYNONYMS)
    materials = match_labels(labels, MATERIAL_SYNONYMS)

    return AnalysisResult(
        garments=[GarmentDetection(garment=g, confidence=c) for g, c in garments],
        materials=[MaterialDetection(material=m, confidence=c) for m, c in materials],
        repair_guides=[guide for m, _ in materials if (guide := get_guide(m)) is not None],
        labels=labels,
    )
