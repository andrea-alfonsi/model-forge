from pydantic import BaseModel,Field
from datetime import datetime
from app.models.model import ModelTask
from typing import Optional
from app.models.model import ModelsAvailable, Hyperpamerters

class ModelBase(BaseModel):
    id: int
    name: str
    description: str | None = None
    owner_id: int

class ModelCreateRequest(BaseModel):
    name: str = Field(description="The name of the new model, the combination user/model-name must be unique")
    kind: ModelsAvailable
    task: ModelTask
    trainingHyperparameters: Hyperpamerters
    training_dataset_id: int
    description: Optional[str]
    derived_from_id: Optional[int] = Field(default=None)

class ModelCreateResponse(BaseModel):
    training_id: int

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