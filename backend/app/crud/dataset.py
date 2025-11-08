from sqlalchemy.orm import Session
from fastapi import UploadFile
import shutil
import os
from typing import Union, Optional
from app.models.dataset import DatasetInfo, Dataset, TabularDatasetInfo, TabularDataset, DatasetType
from app.schemas.dataset import DatasetCreate, DatasetUpdate, DatasetRead

DATASET_CLASS_MAP = {
    DatasetType.generic: Dataset,
    DatasetType.tabular: TabularDataset
}

def create_dataset(db: Session, dataset: DatasetCreate):
    try:
        TargetClass = DATASET_CLASS_MAP[dataset.dataset_type]
    except KeyError:
        # Handle unknown type gracefully, maybe default to the base class or raise error
        TargetClass = Dataset
    db_dataset = TargetClass(**dataset.dict())
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset

def get_dataset(db: Session, dataset_id: int):
    return db.query(Dataset).filter(Dataset.id == dataset_id).first()

def get_datasets(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Dataset).offset(skip).limit(limit).all()

def upload_dataset_file(db: Session, dataset_id: int, file: UploadFile):
    db_dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    temp_file_path = f"/tmp/{dataset_id}_{file.filename}"
    if db_dataset:
        # Create a temporary file for validation
        file_content = file.file.read()
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file_content)
        errors = db_dataset.validate_new_file(temp_file_path)
        if errors is not None:
            os.remove(temp_file_path)
            return errors
        # If there are no errors confirm the dataset
        permanent_dir = f"/data/{dataset_id}"
        permanent_file_path = f"{permanent_dir}/{file.filename}"
        os.makedirs(permanent_dir, exist_ok=True)
        shutil.move(temp_file_path, permanent_file_path)
        db_dataset.uri = f"file://{permanent_file_path}"
        db.commit()
        db.refresh(db_dataset)
    return db_dataset

def delete_dataset(db: Session, dataset_id: int):
    db_dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if db_dataset:
        db.delete(db_dataset)
        db.commit()
    return db_dataset

def get_dataset_infos( db: Session, dataset_id: int ) -> Optional[Union[DatasetInfo, dict]] :
    db_dataset = get_dataset( db, dataset_id )
    if not db_dataset:
        return None
    return db_dataset.dataset_info


def update_dataset(db: Session, dataset_id: int, dataset: DatasetUpdate):
    raise NotImplementedError("Function update dataset not implemented yet")