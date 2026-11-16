import asyncio
import io
import os
import uuid
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import text

from app import models  # noqa: F401  (registers tables)
from app.auth import AuthUser, get_current_user, get_optional_user
from app.config import Settings
from app.db import Base, make_engine
from app.main import create_app

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", "postgresql+asyncpg://postgres:postgres@127.0.0.1:54322/fixknit_test"
)


@pytest.fixture(scope="session", autouse=True)
def _schema() -> Iterator[None]:
    async def create() -> None:
        engine = make_engine(TEST_DATABASE_URL)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        await engine.dispose()

    asyncio.run(create())
    yield


@pytest.fixture(autouse=True)
def _clean_tables() -> Iterator[None]:
    yield

    async def truncate() -> None:
        engine = make_engine(TEST_DATABASE_URL)
        names = ", ".join(t.name for t in Base.metadata.sorted_tables)
        async with engine.begin() as conn:
            await conn.execute(text(f"TRUNCATE {names} CASCADE"))
        await engine.dispose()

    asyncio.run(truncate())


@pytest.fixture
def settings() -> Settings:
    return Settings(
        _env_file=None,
        vision_provider="fake",
        inspiration_provider="fake",
        media_store="memory",
        database_url=TEST_DATABASE_URL,
        supabase_secret_key="",
    )


class Auth:
    """Switch who the test client is signed in as."""

    def __init__(self) -> None:
        self.user: AuthUser | None = None

    def sign_in(self, user_id: uuid.UUID | None = None, guest: bool = True) -> AuthUser:
        self.user = AuthUser(id=user_id or uuid.uuid4(), is_guest=guest)
        return self.user

    def sign_out(self) -> None:
        self.user = None


@pytest.fixture
def auth() -> Auth:
    return Auth()


@pytest.fixture
def client(settings: Settings, auth: Auth) -> Iterator[TestClient]:
    app = create_app(settings)

    def current() -> AuthUser:
        if auth.user is None:
            from fastapi import HTTPException

            raise HTTPException(401, "Sign in to continue")
        return auth.user

    app.dependency_overrides[get_current_user] = current
    app.dependency_overrides[get_optional_user] = lambda: auth.user
    with TestClient(app) as c:
        yield c


def make_image(fmt: str = "PNG", size: tuple[int, int] = (64, 64), color: str = "green") -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format=fmt)
    return buf.getvalue()


def onboard(client: TestClient, auth: Auth, handle: str = "maker") -> AuthUser:
    user = auth.sign_in()
    r = client.put("/api/me/profile", json={"handle": handle, "display_name": handle.title()})
    assert r.status_code == 200, r.text
    return user


def upload(client: TestClient, color: str = "green") -> str:
    r = client.post("/api/media", files={"file": ("p.png", make_image(color=color), "image/png")})
    assert r.status_code == 201, r.text
    return str(r.json()["id"])
