from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timezone
from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.project import Project, ProjectMember, MemberRole
from app.models.task import Task, TaskStatus, TaskComment
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskOut,
    CommentCreate, CommentOut, DashboardStats,
)
from app.core.deps import get_current_user

router = APIRouter(tags=["Tasks"])


def _task_to_dict(task: Task) -> dict:
    data = TaskOut.model_validate(task).model_dump()
    if task.due_date and task.status != TaskStatus.done:
        due = task.due_date.replace(tzinfo=timezone.utc) if task.due_date.tzinfo is None else task.due_date
        data["is_overdue"] = due < datetime.now(timezone.utc)
    else:
        data["is_overdue"] = False
    return data


def _load_task(task_id: int, db: Session) -> Task:
    return (
        db.query(Task)
        .options(
            joinedload(Task.assignee),
            joinedload(Task.creator),
            joinedload(Task.comments).joinedload(TaskComment.author),
        )
        .filter(Task.id == task_id)
        .first()
    )


def _assert_project_access(project_id: int, current_user: User, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if current_user.role == UserRole.admin:
        return project
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id,
    ).first()
    if not membership and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not a member of this project")
    return project


# ── Project Tasks ──────────────────────────────────────────────────────────────

@router.post("/projects/{project_id}/tasks", response_model=dict, status_code=201)
def create_task(
    project_id: int,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_project_access(project_id, current_user, db)
    if task_data.assignee_id:
        if not db.query(User).filter(User.id == task_data.assignee_id).first():
            raise HTTPException(status_code=404, detail="Assignee not found")

    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        due_date=task_data.due_date,
        project_id=project_id,
        assignee_id=task_data.assignee_id,
        creator_id=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return _task_to_dict(_load_task(task.id, db))


@router.get("/projects/{project_id}/tasks", response_model=List[dict])
def list_project_tasks(
    project_id: int,
    task_status: Optional[TaskStatus] = None,
    assignee_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _assert_project_access(project_id, current_user, db)
    q = (
        db.query(Task)
        .options(
            joinedload(Task.assignee),
            joinedload(Task.creator),
            joinedload(Task.comments).joinedload(TaskComment.author),
        )
        .filter(Task.project_id == project_id)
    )
    if task_status:
        q = q.filter(Task.status == task_status)
    if assignee_id:
        q = q.filter(Task.assignee_id == assignee_id)
    return [_task_to_dict(t) for t in q.order_by(Task.created_at.desc()).all()]


@router.get("/tasks/{task_id}", response_model=dict)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = _load_task(task_id, db)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    _assert_project_access(task.project_id, current_user, db)
    return _task_to_dict(task)


@router.put("/tasks/{task_id}", response_model=dict)
def update_task(
    task_id: int,
    update_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    _assert_project_access(task.project_id, current_user, db)
    for field, value in update_data.model_dump(exclude_none=True).items():
        setattr(task, field, value)
    db.commit()
    return _task_to_dict(_load_task(task_id, db))


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    project = db.query(Project).filter(Project.id == task.project_id).first()
    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id,
    ).first()
    can_delete = (
        current_user.role == UserRole.admin
        or task.creator_id == current_user.id
        or project.owner_id == current_user.id
        or (membership and membership.role == MemberRole.admin)
    )
    if not can_delete:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")
    db.delete(task)
    db.commit()


# ── Comments ───────────────────────────────────────────────────────────────────

@router.post("/tasks/{task_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    task_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    comment = TaskComment(
        content=comment_data.content,
        task_id=task_id,
        author_id=current_user.id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = db.query(TaskComment).filter(TaskComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.author_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(comment)
    db.commit()


# ── Dashboard ──────────────────────────────────────────────────────────────────

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.project import ProjectStatus as PS

    now = datetime.now(timezone.utc)

    if current_user.role == UserRole.admin:
        tq = db.query(Task)
        pq = db.query(Project)
    else:
        member_pids = (
            db.query(ProjectMember.project_id)
            .filter(ProjectMember.user_id == current_user.id)
            .subquery()
        )
        tq = db.query(Task).filter(
            (Task.project_id.in_(member_pids)) | (Task.assignee_id == current_user.id)
        )
        pq = db.query(Project).filter(
            (Project.owner_id == current_user.id) | (Project.id.in_(member_pids))
        )

    all_active = tq.filter(Task.status != TaskStatus.done, Task.due_date.isnot(None)).all()
    overdue = sum(
        1 for t in all_active
        if (t.due_date.replace(tzinfo=timezone.utc) if t.due_date.tzinfo is None else t.due_date) < now
    )

    return DashboardStats(
        total_tasks=tq.count(),
        todo=tq.filter(Task.status == TaskStatus.todo).count(),
        in_progress=tq.filter(Task.status == TaskStatus.in_progress).count(),
        in_review=tq.filter(Task.status == TaskStatus.in_review).count(),
        done=tq.filter(Task.status == TaskStatus.done).count(),
        overdue=overdue,
        total_projects=pq.count(),
        active_projects=pq.filter(Project.status == PS.active).count(),
    )


@router.get("/dashboard/my-tasks", response_model=List[dict])
def get_my_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tasks = (
        db.query(Task)
        .options(
            joinedload(Task.assignee),
            joinedload(Task.creator),
            joinedload(Task.comments).joinedload(TaskComment.author),
        )
        .filter(Task.assignee_id == current_user.id)
        .order_by(Task.due_date.asc().nullslast())
        .all()
    )
    return [_task_to_dict(t) for t in tasks]
