from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.routes.me import profile_out
from app.auth import OptionalUser
from app.db import SessionDep
from app.models import Profile
from app.schemas.social import ProfileOut

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/{handle}")
async def read_profile(handle: str, session: SessionDep, viewer: OptionalUser) -> ProfileOut:
    profile = await session.scalar(select(Profile).where(Profile.handle == handle.lower()))
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No maker called @{handle}")
    return await profile_out(session, profile, viewer is not None and viewer.id == profile.id)
