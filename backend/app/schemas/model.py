from pydantic import BaseModel,Field
from datetime import datetime
from app.models.model import ModelTask
from typing import Optional

class TrainingJobHyperparameter(BaseModel):
    batch: int

class ModelBase(BaseModel):
    id: int
    name: str
    description: str | None = None
    owner_id: int
    is_active: bool = True

class ModelCreateRequest(BaseModel):
    name: str = Field(description="The name of the new model, the combination user/model-name must be unique")
    description: Optional[str]
    task: ModelTask
    derived_from_id: int
    training_dataset_id: int
    trainingHyperparameters: TrainingJobHyperparameter = Field()

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