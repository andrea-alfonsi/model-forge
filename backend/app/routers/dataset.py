from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import dataset as crud
from app.schemas import dataset
from app.database import get_db
from app.models.dataset import DatasetType

router = APIRouter(
    prefix="/datasets",       # all endpoints start with /datasets
    tags=["datasets"],        # groups them in the docs
)
@router.get("/", response_model=List[dataset.DatasetRead])
async def list_datasets(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_datasets(db, skip=skip, limit=limit)

@router.get("/{dataset_id}", response_model=dataset.DatasetRead)
async def read_dataset(dataset_id: int, db: Session = Depends(get_db)):
    db_dataset = crud.get_dataset(db, dataset_id=dataset_id)
    if not db_dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return db_dataset

@router.get("/{dataset_id}/infos")
async def dataset_infos(dataset_id: int, db: Session = Depends(get_db)):
    infos = crud.get_dataset_infos( db, dataset_id )
    if infos is None:
        return HTTPException(status_code=404, detail="Dataset not found")
    if isinstance( infos, dict ):
        return infos
    return infos.dict()

@router.post("/", response_model=dataset.DatasetRead)
async def create_dataset(dataset: dataset.DatasetCreate, db: Session = Depends(get_db)):
    return crud.create_dataset(db=db, dataset=dataset)

# @router.patch("/{dataset_id}/data/append", response_model=dataset.DatasetRead)
# async def update_dataset(dataset_id: int, file: UploadFile, db: Session = Depends(get_db)):
#     db_dataset = crud.update_dataset(db, dataset_id=dataset_id, file=file)
#     if not db_dataset:
#         raise HTTPException(status_code=404, detail="Dataset not found")
#     return db_dataset

@router.put("/{dataset_id}/data/upload")
async def upload_dataset_file(dataset_id: int, file: UploadFile, db: Session = Depends(get_db)):
    db_dataset = crud.upload_dataset_file(db, dataset_id=dataset_id, file=file)
    if not db_dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    if isinstance(db_dataset, str):
        return { "message": db_dataset, "type": "error"}
    return {"message": "File URI updated successfully", "dataset_id": dataset_id, "uri": db_dataset.uri}

@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    db_dataset = crud.delete_dataset(db, dataset_id=dataset_id)
    if not db_dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {"result": "ok"}