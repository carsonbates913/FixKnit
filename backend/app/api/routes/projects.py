import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import MediaStoreDep
from app.auth import CurrentProfile
from app.db import SessionDep
from app.models import Diagnosis, Post, PostMedia, Project, ProjectUpdate
from app.schemas.diagnosis import DiagnosisResult
from app.schemas.social import (
    PostOut,
    ProjectCreate,
    ProjectOut,
    ProjectPatch,
    ProjectStatus,
    ProjectUpdateIn,
    PublishProject,
)
from app.services.media import owned_media
from app.services.posts import serialize_posts
from app.services.projects import project_out

router = APIRouter(prefix="/projects", tags=["projects"])


async def _owned_project(
    session: SessionDep, project_id: uuid.UUID, owner_id: uuid.UUID
) -> Project:
    project = await session.get(Project, project_id)
    if project is None or project.owner_id != owner_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
    return project


async def _reload(session: SessionDep, project_id: uuid.UUID) -> Project:
    project = await session.get(Project, project_id, populate_existing=True)
    assert project is not None
    return project


@router.get("")
async def list_projects(
    profile: CurrentProfile, session: SessionDep, store: MediaStoreDep
) -> list[ProjectOut]:
    projects = await session.scalars(
        select(Project).where(Project.owner_id == profile.id).order_by(Project.updated_at.desc())
    )
    return [project_out(p, store.public_url) for p in projects]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreate,
    profile: CurrentProfile,
    session: SessionDep,
    store: MediaStoreDep,
) -> ProjectOut:
    """Start a project from one of a diagnosis's repair options."""
    diagnosis = await session.get(Diagnosis, body.diagnosis_id)
    if diagnosis is None or diagnosis.owner_id != profile.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Diagnosis not found")
    result = DiagnosisResult.model_validate(diagnosis.result)
    option = next((o for o in result.options if o.id == body.option_id), None)
    if option is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, "That repair option isn’t part of this diagnosis"
        )

    garment = result.garment.value if result.garment else None
    project = Project(
        owner_id=profile.id,
        diagnosis_id=diagnosis.id,
        title=body.title or (f"{option.title} on a {garment}" if garment else option.title),
        status=ProjectStatus.PLANNING,
        garment=garment,
        material=result.material.value if result.material else None,
        technique=option.technique.value if option.technique else None,
        plan=option.model_dump(mode="json"),
        steps_done=[],
        before_media_id=diagnosis.media_id,
    )
    session.add(project)
    await session.flush()
    project_id = project.id
    await session.commit()
    return project_out(await _reload(session, project_id), store.public_url)


@router.get("/{project_id}")
async def read_project(
    project_id: uuid.UUID,
    profile: CurrentProfile,
    session: SessionDep,
    store: MediaStoreDep,
) -> ProjectOut:
    return project_out(await _owned_project(session, project_id, profile.id), store.public_url)


@router.patch("/{project_id}")
async def update_project(
    project_id: uuid.UUID,
    body: ProjectPatch,
    profile: CurrentProfile,
    session: SessionDep,
    store: MediaStoreDep,
) -> ProjectOut:
    project = await _owned_project(session, project_id, profile.id)
    if body.title is not None:
        project.title = body.title
    if body.steps_done is not None:
        step_count = len(project.plan.get("steps", []))
        project.steps_done = sorted({i for i in body.steps_done if 0 <= i < step_count})
        if project.steps_done and project.status == ProjectStatus.PLANNING:
            project.status = ProjectStatus.IN_PROGRESS
    if body.status is not None:
        project.status = body.status
    await session.commit()
    return project_out(await _reload(session, project.id), store.public_url)


@router.post("/{project_id}/updates", status_code=status.HTTP_201_CREATED)
async def add_update(
    project_id: uuid.UUID,
    body: ProjectUpdateIn,
    profile: CurrentProfile,
    session: SessionDep,
    store: MediaStoreDep,
) -> ProjectOut:
    """Log progress, or the finished result (an 'after' update marks the project done)."""
    project = await _owned_project(session, project_id, profile.id)
    if body.media_id:
        await owned_media(session, profile.id, [body.media_id])
    elif body.kind == "after":
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, "Add a photo of the finished repair"
        )
    session.add(
        ProjectUpdate(
            project_id=project.id, kind=body.kind, note=body.note.strip(), media_id=body.media_id
        )
    )
    project.status = ProjectStatus.DONE if body.kind == "after" else ProjectStatus.IN_PROGRESS
    await session.commit()
    return project_out(await _reload(session, project.id), store.public_url)


@router.post("/{project_id}/publish", status_code=status.HTTP_201_CREATED)
async def publish_project(
    project_id: uuid.UUID,
    body: PublishProject,
    profile: CurrentProfile,
    session: SessionDep,
    store: MediaStoreDep,
) -> PostOut:
    """Share a finished project as a before/after post."""
    project = await _owned_project(session, project_id, profile.id)
    if project.post_id:
        raise HTTPException(status.HTTP_409_CONFLICT, "This project is already shared")
    after = next((u for u in reversed(project.updates) if u.kind == "after" and u.media_id), None)
    if after is None or project.before_media_id is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, "Add a photo of the finished repair first"
        )

    post = Post(
        author_id=profile.id,
        project_id=project.id,
        caption=body.caption.strip() or project.title,
        technique=project.technique,
        tags=[t for t in [project.technique, project.material, "visiblemending"] if t],
        media=[
            PostMedia(media_id=project.before_media_id, role="before", position=0),
            PostMedia(media_id=after.media_id, role="after", position=1),
        ],
    )
    session.add(post)
    await session.flush()
    post_id = project.post_id = post.id
    await session.commit()
    fresh = await session.get(Post, post_id, populate_existing=True)
    assert fresh is not None
    return (await serialize_posts(session, [fresh], profile.id, store.public_url))[0]
