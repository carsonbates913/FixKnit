from fastapi import APIRouter

from app.schemas import Health

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> Health:
    return Health()
