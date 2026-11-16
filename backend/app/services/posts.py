import uuid
from collections.abc import Sequence

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Like, Post
from app.schemas.social import PostMediaOut, PostOut, ProfileSummary


async def serialize_posts(
    session: AsyncSession, posts: Sequence[Post], viewer_id: uuid.UUID | None
) -> list[PostOut]:
    ids = [p.id for p in posts]
    counts: dict[uuid.UUID, int] = {}
    liked: set[uuid.UUID] = set()
    if ids:
        rows = await session.execute(
            select(Like.post_id, func.count()).where(Like.post_id.in_(ids)).group_by(Like.post_id)
        )
        counts = {post_id: n for post_id, n in rows}
        if viewer_id:
            liked = set(
                await session.scalars(
                    select(Like.post_id).where(Like.post_id.in_(ids), Like.user_id == viewer_id)
                )
            )
    return [
        PostOut(
            id=p.id,
            author=ProfileSummary(handle=p.author.handle, display_name=p.author.display_name),
            caption=p.caption,
            technique=p.technique,
            tags=p.tags,
            media=[
                PostMediaOut(
                    id=pm.media.id,
                    url=pm.media.url,
                    width=pm.media.width,
                    height=pm.media.height,
                    role=pm.role,
                )
                for pm in p.media
            ],
            like_count=counts.get(p.id, 0),
            liked_by_me=p.id in liked,
            project_id=p.project_id,
            created_at=p.created_at,
        )
        for p in posts
    ]


def feed_query() -> Select[Post]:
    return select(Post).order_by(Post.created_at.desc(), Post.id.desc())
