import uuid

from fastapi import APIRouter, HTTPException, UploadFile, status

from app.api.deps import AdvisorDep, MediaStoreDep, SettingsDep
from app.auth import CurrentProfile
from app.db import SessionDep
from app.models import Diagnosis
from app.schemas.diagnosis import DiagnosisOut, DiagnosisResult
from app.services.assistant import check_diagnosis_limit
from app.services.media import UrlFor, store_upload

router = APIRouter(prefix="/diagnoses", tags=["diagnoses"])


def diagnosis_out(d: Diagnosis, url_for: UrlFor) -> DiagnosisOut:
    return DiagnosisOut(
        **DiagnosisResult.model_validate(d.result).model_dump(),
        id=d.id,
        photo_url=url_for(d.media.path),
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
    """Photograph a damaged garment: identify it, find the damage and propose repair options.

    If the photo isn't a damaged garment, `outcome` says why and `notes` says what to retake.
    """
    await check_diagnosis_limit(session, profile.id, settings.diagnoses_per_hour)
    media, image = await store_upload(file, profile.id, settings, store, session)
    result = await advisor.diagnose(image.data)
    diagnosis = Diagnosis(owner_id=profile.id, media=media, result=result.model_dump(mode="json"))
    session.add(diagnosis)
    await session.commit()
    await session.refresh(diagnosis)
    return diagnosis_out(diagnosis, store.public_url)


@router.get("/{diagnosis_id}")
async def read_diagnosis(
    diagnosis_id: uuid.UUID,
    profile: CurrentProfile,
    session: SessionDep,
    store: MediaStoreDep,
) -> DiagnosisOut:
    diagnosis = await session.get(Diagnosis, diagnosis_id)
    if diagnosis is None or diagnosis.owner_id != profile.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Diagnosis not found")
    return diagnosis_out(diagnosis, store.public_url)
