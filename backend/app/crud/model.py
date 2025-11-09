import os
from sqlalchemy.orm import Session
from app.models.model import Model
from app.models.training_job import TrainingJob
from app.schemas.model import ModelCreateRequest
from celery import Celery

broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
back_url = os.getenv("CELERY_RESULT_BACKEND", "db+postgresql+psycopg2://user:password@db:5432/mydb")
celery_app = Celery("backedn", broker=broker_url, backend=back_url)


def create_model(db: Session, model: ModelCreateRequest):
    db_model = Model(name=model.name,description=model.description,task=model.task,derived_from_id=model.derived_from_id)
    db_training = TrainingJob(dataset_id=model.training_dataset_id, model=db_model,hyperparameters=model.trainingHyperparameters.dict())
    db.add(db_model)
    db.add(db_training)
    db.commit()
    db.refresh(db_model)
    client = celery_app.send_task("models.train", kwargs={"job_id": db_training.id})
    return {'training_id': db_training.id}

def get_model(db: Session, model_id: int):
    return db.query(Model).filter(Model.id == model_id).first()

def get_models(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Model).offset(skip).limit(limit).all()