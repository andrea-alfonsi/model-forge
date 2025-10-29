from pydantic import BaseModel
from datetime import datetime
from app.models.model import ModelTask

class ModelBase(BaseModel):
    id: int
    name: str
    description: str | None = None
    owner_id: int
    is_active: bool = True

class ModelCreate(BaseModel):
    name: str
    task: ModelTask

class ModelUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None

class ModelInDB(ModelBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ModelRead(ModelInDB):
    pass