from sqlalchemy.orm import Session
from fastapi import UploadFile
import enum
import os
from app.models import dataset as models
from app.schemas import dataset as schemas

def create_dataset(db: Session, dataset: schemas.DatasetCreate):
    db_dataset = models.Dataset(**dataset.dict())
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset

def get_dataset(db: Session, dataset_id: int):
    return db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()

def get_datasets(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Dataset).offset(skip).limit(limit).all()

def upload_dataset_file(db: Session, dataset_id: int, file: UploadFile):
    db_dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if db_dataset:
        os.makedirs(f"/data/{dataset_id}", exist_ok=True)
        with open(f"/data/{dataset_id}/{file.filename}", "wb") as buffer:
            buffer.write(file.file.read())
        db_dataset.uri = f"file:///data/{dataset_id}/{file.filename}"
        db.commit()
        db.refresh(db_dataset)
    return db_dataset

def delete_dataset(db: Session, dataset_id: int):
    db_dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if db_dataset:
        db.delete(db_dataset)
        db.commit()
    return db_dataset

def update_dataset(db: Session, dataset_id: int, dataset: schemas.DatasetUpdate):
    raise NotImplementedError("Function update dataset not implemented yet")
    db_dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not db_dataset:
        return None
    update_data = dataset.dict(exclude_unset=True)
    for key, value in update_data.items():
        if mode == UpdateDatasetMode.overwrite or getattr(db_dataset, key) is None:
            setattr(db_dataset, key, value)
        elif mode == UpdateDatasetMode.append and isinstance(value, list):
            existing_value = getattr(db_dataset, key)
            if existing_value is None:
                existing_value = []
            setattr(db_dataset, key, existing_value + value)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset