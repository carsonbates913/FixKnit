import logging

import httpx
from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.api.deps import MediaStoreDep, SettingsDep
from app.auth import CurrentUser
from app.db import SessionDep
from app.models import Media, Post, Profile
from app.schemas.social import Me, ProfileIn, ProfileOut

router = APIRouter(prefix="/me", tags=["me"])
logger = logging.getLogger(__name__)


async def profile_out(session: SessionDep, profile: Profile, is_me: bool) -> ProfileOut:
    post_count = await session.scalar(
        select(func.count()).select_from(Post).where(Post.author_id == profile.id)
    )
    return ProfileOut(
        handle=profile.handle,
        display_name=profile.display_name,
        bio=profile.bio,
        techniques=profile.techniques,
        post_count=post_count or 0,
        is_me=is_me,
        created_at=profile.created_at,
    )


@router.get("")
async def read_me(user: CurrentUser, session: SessionDep) -> Me:
    profile = await session.get(Profile, user.id)
    return Me(
        user_id=user.id,
        is_guest=user.is_guest,
        profile=await profile_out(session, profile, True) if profile else None,
    )


@router.put("/profile")
async def upsert_profile(body: ProfileIn, user: CurrentUser, session: SessionDep) -> ProfileOut:
    """Create the caller's profile (onboarding) or update it."""
    profile = await session.get(Profile, user.id)
    if profile is None:
        profile = Profile(id=user.id, handle=body.handle)
        session.add(profile)
    profile.handle = body.handle
    profile.display_name = body.display_name
    profile.bio = body.bio
    profile.techniques = list(body.techniques)
    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, f"@{body.handle} is taken") from exc
    await session.refresh(profile)
    return await profile_out(session, profile, True)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    user: CurrentUser, session: SessionDep, store: MediaStoreDep, settings: SettingsDep
) -> Response:
    """Delete the caller's account: photos, posts, projects, profile and the auth user."""
    paths = list(await session.scalars(select(Media.path).where(Media.owner_id == user.id)))
    profile = await session.get(Profile, user.id)
    if profile:
        await session.delete(profile)
        await session.commit()
    await store.delete(paths)
    if settings.supabase_secret_key:
        headers = {"apikey": settings.supabase_secret_key}
        if not settings.supabase_secret_key.startswith("sb_"):
            headers["Authorization"] = f"Bearer {settings.supabase_secret_key}"
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.delete(
                f"{settings.supabase_url}/auth/v1/admin/users/{user.id}", headers=headers
            )
            if r.is_error:
                logger.warning("Auth user delete failed %s: %s", r.status_code, r.text[:200])
    return Response(status_code=status.HTTP_204_NO_CONTENT)
