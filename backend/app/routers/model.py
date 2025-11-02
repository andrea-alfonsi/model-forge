from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import model as crud
from app.schemas import model
from app.database import get_db

router = APIRouter(
    prefix="/models",       # all endpoints start with /models
    tags=["models"],        # groups them in the docs
)

@router.post("/add", response_model=model.ModelRead)
async def create_model(model: model.ModelCreate, db: Session = Depends(get_db)):
    return crud.create_model(db=db, model=model)

@router.get("/", response_model=List[model.ModelRead])
async def list_models(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_models(db, skip=skip, limit=limit)

@router.get("/available/{task}", response_model=List[str])
async def available_models(task: str):
    return ["ok"]

@router.get("/{model_id}", response_model=model.ModelRead)
async def read_model(model_id: int, db: Session = Depends(get_db)):
    db_model = crud.get_model(db, model_id=model_id)
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")
    return db_model