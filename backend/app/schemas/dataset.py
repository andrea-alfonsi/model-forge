from pydantic import BaseModel
from datetime import datetime
import enum
from fastapi import UploadFile
from app.models.dataset import DatasetType

class DatasetBase(BaseModel):
    id: int
    name: str
    description: str | None = None
    owner_id: int
    is_active: bool = True

class DatasetCreate(BaseModel):
    name: str
    description: str | None = None
    dataset_type: DatasetType

class DatasetUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None

class DatasetInDB(DatasetBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DatasetRead(DatasetInDB):
    pass