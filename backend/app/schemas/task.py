from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.task import TaskStatus, TaskPriority
from app.schemas.user import UserOut


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Task title cannot be empty")
        return v.strip()


class TaskCreate(TaskBase):
    assignee_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None


class CommentCreate(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Comment cannot be empty")
        return v.strip()


class CommentOut(BaseModel):
    id: int
    content: str
    author: UserOut
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskOut(TaskBase):
    id: int
    status: TaskStatus
    project_id: int
    assignee: Optional[UserOut] = None
    creator: Optional[UserOut] = None
    comments: List[CommentOut] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_overdue: Optional[bool] = False

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_tasks: int
    todo: int
    in_progress: int
    in_review: int
    done: int
    overdue: int
    total_projects: int
    active_projects: int
