"""Glue between projects and the repair assistant: usage limits and the project brief."""

import logging
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import func, select

from app.db import SessionDep
from app.models import Diagnosis, Project, ProjectMessage
from app.providers.advisor import ProjectBrief
from app.providers.errors import ProviderError
from app.providers.storage import MediaStore
from app.schemas.diagnosis import ChatRole, DiagnosisResult, RepairOption

logger = logging.getLogger(__name__)


def _hour_ago() -> datetime:
    return datetime.now(UTC) - timedelta(hours=1)


async def check_diagnosis_limit(session: SessionDep, owner_id: uuid.UUID, limit: int) -> None:
    used = await session.scalar(
        select(func.count())
        .select_from(Diagnosis)
        .where(Diagnosis.owner_id == owner_id, Diagnosis.created_at > _hour_ago())
    )
    if (used or 0) >= limit:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "You’ve hit this hour’s limit for photo diagnoses. Try again a little later.",
        )


async def check_chat_limit(session: SessionDep, owner_id: uuid.UUID, limit: int) -> None:
    used = await session.scalar(
        select(func.count())
        .select_from(ProjectMessage)
        .join(Project, Project.id == ProjectMessage.project_id)
        .where(
            Project.owner_id == owner_id,
            ProjectMessage.role == ChatRole.USER,
            ProjectMessage.created_at > _hour_ago(),
        )
    )
    if (used or 0) >= limit:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "You’ve asked a lot this hour. Take a breather and try again a little later.",
        )


async def project_brief(session: SessionDep, project: Project, store: MediaStore) -> ProjectBrief:
    """Describe a project in text, with its before photo and its latest photo."""
    plan = RepairOption.model_validate(project.plan)
    done = set(project.steps_done)
    lines = [
        f"Title: {project.title}",
        f"Status: {project.status}",
        f"Garment: {project.garment or 'unknown'}; material: {project.material or 'unknown'}",
    ]
    if project.diagnosis_id:
        diagnosis = await session.get(Diagnosis, project.diagnosis_id)
        if diagnosis:
            result = DiagnosisResult.model_validate(diagnosis.result)
            for d in result.damages:
                size = f", about {d.size_cm:g} cm" if d.size_cm else ""
                lines.append(f"Damage: {d.severity} {d.kind} at {d.location}{size}")
    lines += [
        f"Chosen repair: {plan.title} ({plan.visibility}, difficulty {plan.difficulty}/3, "
        f"about {plan.minutes} min). {plan.summary}",
        "Materials: " + "; ".join(plan.materials),
        "Steps:",
        *(f"{i + 1}. [{'done' if i in done else 'to do'}] {s}" for i, s in enumerate(plan.steps)),
    ]
    notes = [u for u in project.updates if u.note]
    if notes:
        lines.append("Their notes so far:")
        lines += [f"- ({u.kind}) {u.note}" for u in notes]

    wanted: list[tuple[str, str]] = []
    if project.before_media:
        wanted.append((project.before_media.path, "the damage before repair"))
    latest = next((u.media for u in reversed(project.updates) if u.media), None)
    if latest:
        wanted.append((latest.path, "their latest photo"))
    photos: list[bytes] = []
    labels: list[str] = []
    for path, label in wanted:
        try:
            photos.append(await store.get(path))
            labels.append(label)
        except ProviderError:
            logger.warning("Skipping unreadable project photo %s", path)
    if labels:
        lines.append("Attached photos, in order: " + "; ".join(labels))
    return ProjectBrief(summary="\n".join(lines), photos=photos)
