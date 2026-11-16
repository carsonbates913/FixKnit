from fastapi import APIRouter, HTTPException

from app.domain.guides import all_guides, get_guide
from app.domain.taxonomy import Material
from app.schemas import RepairGuide

router = APIRouter(prefix="/guides", tags=["guides"])


@router.get("")
async def list_guides() -> list[RepairGuide]:
    return list(all_guides().values())


@router.get("/{material}")
async def read_guide(material: Material) -> RepairGuide:
    guide = get_guide(material)
    if guide is None:
        raise HTTPException(status_code=404, detail=f"No repair guide for {material}")
    return guide
