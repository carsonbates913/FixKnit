from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import InspirationDep
from app.domain.search import build_inspiration_query
from app.domain.taxonomy import Color, Technique
from app.schemas import InspirationResults

router = APIRouter(prefix="/inspiration", tags=["inspiration"])


@router.get("")
async def search_inspiration(
    provider: InspirationDep,
    q: Annotated[str, Query(min_length=1, max_length=100, description="What to search for")],
    techniques: Annotated[list[Technique], Query()] = [],  # noqa: B006 — FastAPI copies defaults
    colors: Annotated[list[Color], Query()] = [],  # noqa: B006
) -> InspirationResults:
    """Find repair-design inspiration images, e.g. q=sweater&techniques=crochet&colors=green."""
    query = build_inspiration_query(q, techniques, colors)
    return InspirationResults(query=query, images=await provider.search(query))
