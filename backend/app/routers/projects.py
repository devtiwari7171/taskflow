from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.project import Project, ProjectMember, MemberRole, ProjectStatus
from app.models.task import Task, TaskStatus
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectOut,
    AddMemberRequest, UpdateMemberRole, ProjectMemberOut,
)
from app.core.deps import get_current_user, get_project_member, get_project_admin

router = APIRouter(prefix="/projects", tags=["Projects"])


def _enrich(project: Project, db: Session) -> dict:
    task_count = db.query(Task).filter(Task.project_id == project.id).count()
    completed = db.query(Task).filter(
        Task.project_id == project.id, Task.status == TaskStatus.done
    ).count()
    data = ProjectOut.model_validate(project).model_dump()
    data["task_count"] = task_count
    data["completed_task_count"] = completed
    return data


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = Project(
        name=project_data.name,
        description=project_data.description,
        color=project_data.color or "#6366f1",
        owner_id=current_user.id,
    )
    db.add(project)
    db.flush()
    db.add(ProjectMember(project_id=project.id, user_id=current_user.id, role=MemberRole.admin))
    db.commit()
    db.refresh(project)
    return _enrich(project, db)


@router.get("", response_model=List[dict])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Project).options(
        joinedload(Project.owner),
        joinedload(Project.members).joinedload(ProjectMember.user),
    )
    if current_user.role != UserRole.admin:
        member_ids = (
            db.query(ProjectMember.project_id)
            .filter(ProjectMember.user_id == current_user.id)
            .subquery()
        )
        q = q.filter(
            (Project.owner_id == current_user.id) | (Project.id.in_(member_ids))
        )
    return [_enrich(p, db) for p in q.all()]


@router.get("/{project_id}", response_model=dict)
def get_project(
    project: Project = Depends(get_project_member),
    db: Session = Depends(get_db),
):
    return _enrich(project, db)


@router.put("/{project_id}", response_model=dict)
def update_project(
    update_data: ProjectUpdate,
    project: Project = Depends(get_project_admin),
    db: Session = Depends(get_db),
):
    for field, value in update_data.model_dump(exclude_none=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return _enrich(project, db)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project: Project = Depends(get_project_admin),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if project.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Only owner or app admin can delete")
    db.delete(project)
    db.commit()


# ── Members ────────────────────────────────────────────────────────────────────

@router.post("/{project_id}/members", response_model=ProjectMemberOut)
def add_member(
    request: AddMemberRequest,
    project: Project = Depends(get_project_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found with that email")
    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project.id,
        ProjectMember.user_id == user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")
    membership = ProjectMember(project_id=project.id, user_id=user.id, role=request.role)
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    user_id: int,
    project: Project = Depends(get_project_admin),
    db: Session = Depends(get_db),
):
    if user_id == project.owner_id:
        raise HTTPException(status_code=400, detail="Cannot remove the project owner")
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project.id,
        ProjectMember.user_id == user_id,
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(membership)
    db.commit()


@router.patch("/{project_id}/members/{user_id}", response_model=ProjectMemberOut)
def update_member_role(
    user_id: int,
    update: UpdateMemberRole,
    project: Project = Depends(get_project_admin),
    db: Session = Depends(get_db),
):
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project.id,
        ProjectMember.user_id == user_id,
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Member not found")
    membership.role = update.role
    db.commit()
    db.refresh(membership)
    return membership
