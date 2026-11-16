import io
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.config import Settings
from app.main import create_app


@pytest.fixture
def settings() -> Settings:
    return Settings(_env_file=None, vision_provider="fake", inspiration_provider="fake")


@pytest.fixture
def client(settings: Settings) -> Iterator[TestClient]:
    with TestClient(create_app(settings)) as c:
        yield c


def make_image(fmt: str = "PNG", size: tuple[int, int] = (64, 64)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, "green").save(buf, format=fmt)
    return buf.getvalue()
