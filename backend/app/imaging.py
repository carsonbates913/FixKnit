"""Validate and normalise uploaded images entirely in memory."""

import io

from PIL import Image, ImageOps, UnidentifiedImageError

ALLOWED_CONTENT_TYPES = frozenset({"image/jpeg", "image/png", "image/webp"})


class InvalidImageError(ValueError):
    pass


def normalize_image(data: bytes, max_dimension: int) -> bytes:
    """Decode, apply EXIF orientation, downscale to max_dimension, and re-encode as JPEG."""
    try:
        with Image.open(io.BytesIO(data)) as img:
            img.load()
            upright = ImageOps.exif_transpose(img).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidImageError("File is not a readable image") from exc

    upright.thumbnail((max_dimension, max_dimension))
    out = io.BytesIO()
    upright.save(out, format="JPEG", quality=90)
    return out.getvalue()
