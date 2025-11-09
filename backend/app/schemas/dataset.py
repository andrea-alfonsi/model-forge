from pydantic import BaseModel
from datetime import datetime
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
    type: DatasetType

    model_config = {
        "json_schema_extra": {
            "examples": [
                { "name": "MyTabularDataset", "descritpion": None, "type": DatasetType.tabular },
                { "name": "MyDataset", "descritpion": "This dataset requires to be converted into a specific one before it can be used", "type": DatasetType.generic }
            ]
        }
    }

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