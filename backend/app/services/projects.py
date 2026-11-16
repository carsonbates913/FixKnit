from app.models import Project
from app.schemas.diagnosis import RepairOption
from app.schemas.social import ProjectOut, ProjectUpdateOut
from app.services.media import media_out


def project_out(project: Project) -> ProjectOut:
    return ProjectOut(
        id=project.id,
        title=project.title,
        status=project.status,
        garment=project.garment,
        material=project.material,
        technique=project.technique,
        plan=RepairOption.model_validate(project.plan),
        steps_done=sorted(project.steps_done),
        before_photo=media_out(project.before_media) if project.before_media else None,
        updates=[
            ProjectUpdateOut(
                id=u.id,
                kind=u.kind,
                note=u.note,
                photo=media_out(u.media) if u.media else None,
                created_at=u.created_at,
            )
            for u in project.updates
        ],
        post_id=project.post_id,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )
