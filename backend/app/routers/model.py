from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.crud import model as crud
from app.schemas.model import ModelRead, ModelCreateResponse, ModelCreateRequest
from app.database import get_db
from app.models.model import ModelsAvailable

router = APIRouter(
    prefix="/models",
    tags=["models"],
)

@router.get("/", response_model=List[ModelRead])
async def list_models(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_models(db, skip=skip, limit=limit)

@router.post("/", response_model=ModelCreateResponse)
async def create_model(model: ModelCreateRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    return crud.create_model(db=db, model=model, background_tasks=background_tasks)

@router.get("/training_options", response_model=dict)
async def get_model_training_options(name: ModelsAvailable):
    """
    List all the options that are available for the model
    """
    return ModelsAvailable.get_class(name).training_hyperparameters().model_json_schema().get("properties")

@router.get("/{model_id}", response_model=ModelRead)
async def read_model(model_id: int, db: Session = Depends(get_db)):
    db_model = crud.get_model(db, model_id=model_id)
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")
    return db_model
