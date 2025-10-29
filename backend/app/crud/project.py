from sqlalchemy.orm import Session
from app.models import project as  project_model
from app.schemas import project as  project_schema

def create_project(db: Session, project: project_schema.ProjectCreate):
    db_project = project_model.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_project(db: Session, project_id: int):
    return db.query(project_model.Project).filter(project_model.Project.id == project_id).first()

def get_projects(db: Session, skip: int = 0, limit: int = 10):
    return db.query(project_model.Project).offset(skip).limit(limit).all()

def add_dataset( db: Session, project_id: int, dataset_id: int):
    db_project = db.query(project_model.Project).filter(project_model.Project.id == project_id).first()
    if db_project:
        db_project.dataset_id = dataset_id
        db.commit()
        db.refresh(db_project)
    return db_project
