import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.imaging import NormalizedImage, read_image_upload
from app.models import Media
from app.providers.storage import MediaStore
from app.schemas.social import MediaOut


async def store_upload(
    file: UploadFile,
    owner_id: uuid.UUID,
    settings: Settings,
    store: MediaStore,
    session: AsyncSession,
) -> tuple[Media, NormalizedImage]:
    """Validate, normalise and store an uploaded photo, recording it as the owner's media."""
    image = await read_image_upload(file, settings.max_upload_bytes, settings.max_image_dimension)
    media_id = uuid.uuid4()
    path = f"{owner_id}/{media_id}.jpg"
    url = await store.put(path, image.data, image.content_type)
    media = Media(
        id=media_id, owner_id=owner_id, path=path, url=url, width=image.width, height=image.height
    )
    session.add(media)
    await session.flush()
    return media, image


async def owned_media(
    session: AsyncSession, owner_id: uuid.UUID, ids: list[uuid.UUID]
) -> dict[uuid.UUID, Media]:
    """Load media by id, rejecting any that don't exist or belong to someone else."""
    found = (
        await session.scalars(select(Media).where(Media.id.in_(ids), Media.owner_id == owner_id))
    ).all()
    by_id = {m.id: m for m in found}
    if len(by_id) != len(set(ids)):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, "One or more photos weren’t found"
        )
    return by_id


def media_out(media: Media) -> MediaOut:
    return MediaOut(id=media.id, url=media.url, width=media.width, height=media.height)
