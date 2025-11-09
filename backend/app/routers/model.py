from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import model as crud
from app.schemas.model import ModelRead, ModelCreateResponse, ModelCreateRequest
from app.database import get_db
from app.models.model import ModelTask

router = APIRouter(
    prefix="/models",
    tags=["models"],
)

@router.get("/", response_model=List[ModelRead])
async def list_models(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_models(db, skip=skip, limit=limit)

@router.post("/", response_model=ModelCreateResponse)
async def create_model(model: ModelCreateRequest, db: Session = Depends(get_db)):
    return crud.create_model(db=db, model=model)

@router.options("/", response_model=List[str])
async def available_models(task: Optional[ModelTask]):
    """
    List all the options that are available for the model
    """
    return ["ok"]

@router.get("/{model_id}", response_model=ModelRead)
async def read_model(model_id: int, db: Session = Depends(get_db)):
    db_model = crud.get_model(db, model_id=model_id)
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")
    return db_model