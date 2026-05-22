from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.project import ProjectStatus, MemberRole
from app.schemas.user import UserOut


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#6366f1"

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Project name cannot be empty")
        return v.strip()


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    color: Optional[str] = None


class ProjectMemberOut(BaseModel):
    id: int
    user: UserOut
    role: MemberRole
    joined_at: datetime

    model_config = {"from_attributes": True}


class ProjectOut(ProjectBase):
    id: int
    status: ProjectStatus
    owner_id: int
    owner: UserOut
    members: List[ProjectMemberOut] = []
    created_at: datetime
    task_count: Optional[int] = 0
    completed_task_count: Optional[int] = 0

    model_config = {"from_attributes": True}


class AddMemberRequest(BaseModel):
    email: str
    role: MemberRole = MemberRole.member


class UpdateMemberRole(BaseModel):
    role: MemberRole
