"""Repair guides, loaded from data/repair_guides.yaml."""

from functools import cache
from pathlib import Path

import yaml
from pydantic import TypeAdapter

from app.domain.taxonomy import Material
from app.schemas import RepairGuide

_GUIDES_PATH = Path(__file__).resolve().parent.parent / "data" / "repair_guides.yaml"


@cache
def all_guides() -> dict[Material, RepairGuide]:
    raw = yaml.safe_load(_GUIDES_PATH.read_text())
    guides = TypeAdapter(list[RepairGuide]).validate_python(raw)
    return {guide.material: guide for guide in guides}


def get_guide(material: Material) -> RepairGuide | None:
    return all_guides().get(material)
