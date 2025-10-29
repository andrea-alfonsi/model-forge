from sqlalchemy.orm import Session
from app.models import model as models
from app.schemas import model as schemas

def create_model(db: Session, model: schemas.ModelCreate):
    db_model = models.Model(**model.dict())
    db.add(db_model)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset

def get_model(db: Session, model_id: int):
    return db.query(models.Model).filter(models.Model.id == model_id).first()

def get_models(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Model).offset(skip).limit(limit).all()