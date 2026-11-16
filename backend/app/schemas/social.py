"""API contract for profiles, media, projects and posts."""

import re
import uuid
from datetime import datetime
from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator

from app.domain.taxonomy import GarmentType, Material, Technique
from app.schemas.diagnosis import RepairOption

HANDLE_RE = re.compile(r"^[a-z0-9_]{3,20}$")


class MediaOut(BaseModel):
    id: uuid.UUID
    url: str
    width: int
    height: int


class ProfileIn(BaseModel):
    handle: str
    display_name: Annotated[str, Field(min_length=1, max_length=40)]
    bio: Annotated[str, Field(max_length=160)] = ""
    techniques: list[Technique] = []

    @field_validator("handle")
    @classmethod
    def _handle(cls, value: str) -> str:
        value = value.strip().lstrip("@").lower()
        if not HANDLE_RE.match(value):
            raise ValueError("Use 3–20 lowercase letters, numbers or underscores")
        return value

    @field_validator("display_name", "bio")
    @classmethod
    def _strip(cls, value: str) -> str:
        return value.strip()


class ProfileSummary(BaseModel):
    handle: str
    display_name: str


class ProfileOut(ProfileSummary):
    bio: str
    techniques: list[Technique]
    post_count: int
    is_me: bool
    created_at: datetime


class Me(BaseModel):
    user_id: uuid.UUID
    is_guest: bool
    profile: ProfileOut | None


class ProjectStatus(StrEnum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class ProjectCreate(BaseModel):
    diagnosis_id: uuid.UUID
    option_id: str
    title: Annotated[str | None, Field(max_length=80)] = None


class ProjectPatch(BaseModel):
    title: Annotated[str | None, Field(min_length=1, max_length=80)] = None
    status: ProjectStatus | None = None
    steps_done: list[int] | None = None


class ProjectUpdateIn(BaseModel):
    kind: Literal["progress", "after"]
    note: Annotated[str, Field(max_length=1000)] = ""
    media_id: uuid.UUID | None = None


class ProjectUpdateOut(BaseModel):
    id: uuid.UUID
    kind: Literal["progress", "after"]
    note: str
    photo: MediaOut | None
    created_at: datetime


class ProjectOut(BaseModel):
    id: uuid.UUID
    title: str
    status: ProjectStatus
    garment: GarmentType | None
    material: Material | None
    technique: Technique | None
    plan: RepairOption
    steps_done: list[int]
    before_photo: MediaOut | None
    updates: list[ProjectUpdateOut]
    post_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class PublishProject(BaseModel):
    caption: Annotated[str, Field(max_length=2000)] = ""


MediaRole = Literal["before", "after", "gallery"]


class PostMediaIn(BaseModel):
    media_id: uuid.UUID
    role: MediaRole = "gallery"


class PostCreate(BaseModel):
    caption: Annotated[str, Field(max_length=2000)] = ""
    technique: Technique | None = None
    tags: Annotated[list[str], Field(max_length=10)] = []
    media: Annotated[list[PostMediaIn], Field(min_length=1, max_length=6)]

    @field_validator("tags")
    @classmethod
    def _tags(cls, tags: list[str]) -> list[str]:
        cleaned = [re.sub(r"[^a-z0-9_]", "", t.lower().lstrip("#")) for t in tags]
        return list(dict.fromkeys(t for t in cleaned if t))[:10]


class PostMediaOut(MediaOut):
    role: MediaRole


class PostOut(BaseModel):
    id: uuid.UUID
    author: ProfileSummary
    caption: str
    technique: Technique | None
    tags: list[str]
    media: list[PostMediaOut]
    like_count: int
    liked_by_me: bool
    project_id: uuid.UUID | None
    created_at: datetime


class PostPage(BaseModel):
    items: list[PostOut]
    next_cursor: str | None
