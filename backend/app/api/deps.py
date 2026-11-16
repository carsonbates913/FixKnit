from typing import Annotated

from fastapi import Depends, Request

from app.config import Settings
from app.providers.advisor import RepairAdvisor
from app.providers.inspiration import InspirationProvider
from app.providers.storage import MediaStore
from app.providers.vision import VisionProvider


def get_settings(request: Request) -> Settings:
    settings: Settings = request.app.state.settings
    return settings


def get_vision_provider(request: Request) -> VisionProvider:
    provider: VisionProvider = request.app.state.vision
    return provider


def get_inspiration_provider(request: Request) -> InspirationProvider:
    provider: InspirationProvider = request.app.state.inspiration
    return provider


SettingsDep = Annotated[Settings, Depends(get_settings)]
VisionDep = Annotated[VisionProvider, Depends(get_vision_provider)]
InspirationDep = Annotated[InspirationProvider, Depends(get_inspiration_provider)]


def get_media_store(request: Request) -> MediaStore:
    store: MediaStore = request.app.state.media_store
    return store


def get_repair_advisor(request: Request) -> RepairAdvisor:
    advisor: RepairAdvisor = request.app.state.advisor
    return advisor


MediaStoreDep = Annotated[MediaStore, Depends(get_media_store)]
AdvisorDep = Annotated[RepairAdvisor, Depends(get_repair_advisor)]
