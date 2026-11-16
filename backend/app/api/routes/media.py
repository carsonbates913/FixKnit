from fastapi import APIRouter, UploadFile, status

from app.api.deps import MediaStoreDep, SettingsDep
from app.auth import CurrentProfile
from app.db import SessionDep
from app.schemas.social import MediaOut
from app.services.media import media_out, store_upload

router = APIRouter(prefix="/media", tags=["media"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile,
    profile: CurrentProfile,
    settings: SettingsDep,
    store: MediaStoreDep,
    session: SessionDep,
) -> MediaOut:
    """Upload a photo for use in a post or project update."""
    media, _ = await store_upload(file, profile.id, settings, store, session)
    await session.commit()
    return media_out(media)
