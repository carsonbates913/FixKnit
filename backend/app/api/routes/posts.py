import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, Response, status
from sqlalchemy import delete, tuple_
from sqlalchemy.dialects.postgresql import insert

from app.api.deps import MediaStoreDep
from app.auth import CurrentProfile, OptionalUser
from app.db import SessionDep
from app.models import Like, Post, PostMedia, Profile
from app.schemas.social import PostCreate, PostOut, PostPage
from app.services.media import owned_media
from app.services.posts import feed_query, serialize_posts

router = APIRouter(prefix="/posts", tags=["posts"])


def _encode_cursor(post: Post) -> str:
    return f"{post.created_at.isoformat()}~{post.id}"


def _decode_cursor(cursor: str) -> tuple[datetime, uuid.UUID]:
    try:
        stamp, post_id = cursor.split("~")
        return datetime.fromisoformat(stamp), uuid.UUID(post_id)
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Invalid cursor") from exc


@router.get("")
async def list_posts(
    session: SessionDep,
    viewer: OptionalUser,
    store: MediaStoreDep,
    author: str | None = None,
    tag: str | None = None,
    cursor: str | None = None,
    limit: int = Query(20, ge=1, le=50),
) -> PostPage:
    """The community feed, newest first. Filter by author handle or tag."""
    stmt = feed_query()
    if author:
        stmt = stmt.join(Profile, Post.author_id == Profile.id).where(
            Profile.handle == author.lower()
        )
    if tag:
        stmt = stmt.where(Post.tags.contains([tag.lower().lstrip("#")]))
    if cursor:
        stamp, post_id = _decode_cursor(cursor)
        stmt = stmt.where(tuple_(Post.created_at, Post.id) < tuple_(stamp, post_id))
    posts = list((await session.scalars(stmt.limit(limit + 1))).unique())
    page, more = posts[:limit], len(posts) > limit
    return PostPage(
        items=await serialize_posts(session, page, viewer.id if viewer else None, store.public_url),
        next_cursor=_encode_cursor(page[-1]) if more else None,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_post(
    body: PostCreate, profile: CurrentProfile, session: SessionDep, store: MediaStoreDep
) -> PostOut:
    """Share a creation: one to six photos you've uploaded, with a caption."""
    await owned_media(session, profile.id, [m.media_id for m in body.media])
    post = Post(
        author_id=profile.id,
        caption=body.caption.strip(),
        technique=body.technique.value if body.technique else None,
        tags=body.tags,
        media=[
            PostMedia(media_id=m.media_id, role=m.role, position=i)
            for i, m in enumerate(body.media)
        ],
    )
    session.add(post)
    await session.flush()
    post_id = post.id
    await session.commit()
    fresh = await session.get(Post, post_id, populate_existing=True)
    assert fresh is not None
    return (await serialize_posts(session, [fresh], profile.id, store.public_url))[0]


@router.get("/{post_id}")
async def read_post(
    post_id: uuid.UUID, session: SessionDep, viewer: OptionalUser, store: MediaStoreDep
) -> PostOut:
    post = await session.get(Post, post_id)
    if post is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post not found")
    return (
        await serialize_posts(session, [post], viewer.id if viewer else None, store.public_url)
    )[0]


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: uuid.UUID, profile: CurrentProfile, session: SessionDep) -> Response:
    post = await session.get(Post, post_id)
    if post is None or post.author_id != profile.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post not found")
    await session.delete(post)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def like_post(post_id: uuid.UUID, profile: CurrentProfile, session: SessionDep) -> Response:
    if await session.get(Post, post_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post not found")
    await session.execute(
        insert(Like).values(post_id=post_id, user_id=profile.id).on_conflict_do_nothing()
    )
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_post(post_id: uuid.UUID, profile: CurrentProfile, session: SessionDep) -> Response:
    await session.execute(delete(Like).where(Like.post_id == post_id, Like.user_id == profile.id))
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
