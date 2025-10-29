from pydantic import BaseModel
from datetime import datetime
from app.models.project import ProjectType

class ProjectBase(BaseModel):
    id: int
    name: str
    description: str | None = None
    owner_id: int
    is_active: bool = True

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    project_type: ProjectType

class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None

class ProjectInDB(ProjectBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectRead(ProjectInDB):
    dataset_id: int | None = None
    model_id: int | None = None
    project_type: ProjectType