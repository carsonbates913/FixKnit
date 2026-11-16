import uuid

from fastapi import APIRouter, HTTPException, UploadFile, status

from app.api.deps import AdvisorDep, MediaStoreDep, SettingsDep
from app.auth import CurrentProfile
from app.db import SessionDep
from app.models import Diagnosis
from app.schemas.diagnosis import DiagnosisOut, DiagnosisResult
from app.services.media import store_upload

router = APIRouter(prefix="/diagnoses", tags=["diagnoses"])


def diagnosis_out(d: Diagnosis) -> DiagnosisOut:
    return DiagnosisOut(
        **DiagnosisResult.model_validate(d.result).model_dump(),
        id=d.id,
        photo_url=d.media.url,
        created_at=d.created_at,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_diagnosis(
    file: UploadFile,
    profile: CurrentProfile,
    advisor: AdvisorDep,
    settings: SettingsDep,
    store: MediaStoreDep,
    session: SessionDep,
) -> DiagnosisOut:
    """Photograph a damaged garment: identify it, find the damage and propose repair options."""
    media, image = await store_upload(file, profile.id, settings, store, session)
    result = await advisor.diagnose(image.data)
    diagnosis = Diagnosis(owner_id=profile.id, media=media, result=result.model_dump(mode="json"))
    session.add(diagnosis)
    await session.commit()
    await session.refresh(diagnosis)
    return diagnosis_out(diagnosis)


@router.get("/{diagnosis_id}")
async def read_diagnosis(
    diagnosis_id: uuid.UUID, profile: CurrentProfile, session: SessionDep
) -> DiagnosisOut:
    diagnosis = await session.get(Diagnosis, diagnosis_id)
    if diagnosis is None or diagnosis.owner_id != profile.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Diagnosis not found")
    return diagnosis_out(diagnosis)
