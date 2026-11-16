"""Validate and normalise uploaded images entirely in memory."""

import io
from dataclasses import dataclass

from fastapi import HTTPException, UploadFile, status
from PIL import Image, ImageOps, UnidentifiedImageError
from starlette.concurrency import run_in_threadpool

ALLOWED_CONTENT_TYPES = frozenset({"image/jpeg", "image/png", "image/webp"})


class InvalidImageError(ValueError):
    pass


@dataclass(frozen=True)
class NormalizedImage:
    data: bytes
    width: int
    height: int
    content_type: str = "image/jpeg"


def normalize_image(data: bytes, max_dimension: int) -> NormalizedImage:
    """Decode, apply EXIF orientation, downscale to max_dimension, and re-encode as JPEG."""
    try:
        with Image.open(io.BytesIO(data)) as img:
            img.load()
            upright = ImageOps.exif_transpose(img).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidImageError("File is not a readable image") from exc

    upright.thumbnail((max_dimension, max_dimension))
    out = io.BytesIO()
    upright.save(out, format="JPEG", quality=88)
    return NormalizedImage(out.getvalue(), upright.width, upright.height)


async def read_image_upload(
    file: UploadFile, max_bytes: int, max_dimension: int
) -> NormalizedImage:
    """Validate an uploaded image's type and size, then normalise it. Raises HTTP 413/415/422."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type; use one of {sorted(ALLOWED_CONTENT_TYPES)}",
        )
    data = await file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Image exceeds {max_bytes // (1024 * 1024)} MB",
        )
    try:
        return await run_in_threadpool(normalize_image, data, max_dimension)
    except InvalidImageError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)) from exc
