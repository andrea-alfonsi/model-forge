import os
from sqlalchemy.orm import Session, joinedload
import logging
from fastapi import BackgroundTasks
from celery import Celery
from app.database import get_db
from app.models.model import Model
from app.models.training_job import TrainingJob
from app.schemas.model import ModelCreateRequest

broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
back_url = os.getenv("CELERY_RESULT_BACKEND", "db+postgresql+psycopg2://user:password@db:5432/mydb")
celery_app = Celery("backend", broker=broker_url, backend=back_url)

def save_training_result(task):
    result = task.get()
    logger = logging.getLogger()
    logger.error("Calling callback")
    gen = get_db()
    db = next(gen)
    try:
        training_job = db.query(TrainingJob) \
                        .options(joinedload(TrainingJob.model)) \
                        .filter(TrainingJob.id == result["job_id"]).first()
        training_job.report = result["logs_uri"]
        training_job.model.uri = result["model_uri"]
        db.commit()
        logger.error("comit")
    finally:
        # resume generator so `finally` runs
        try:
            next(gen)
        except StopIteration:
            pass


def create_model(db: Session, model: ModelCreateRequest, background_tasks: BackgroundTasks):
    db_model = Model(name=model.name,description=model.description,task=model.task,derived_from_id=model.derived_from_id)
    db_training = TrainingJob(dataset_id=model.training_dataset_id, model=db_model,hyperparameters=model.trainingHyperparameters.dict())
    db.add(db_model)
    db.add(db_training)
    db.commit()
    db.refresh(db_model)
    task = celery_app.send_task("trainer.train_model", kwargs={"job_id": db_training.id})
    background_tasks.add_task( save_training_result, task )
    return {'training_id': db_training.id}

def get_model(db: Session, model_id: int):
    return db.query(Model).filter(Model.id == model_id).first()

def get_models(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Model).offset(skip).limit(limit).all()