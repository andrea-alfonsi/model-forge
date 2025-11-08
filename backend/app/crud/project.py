from sqlalchemy.orm import Session
from app.models.project import Project, ProjectType
from app.models.dataset import Dataset, DatasetType
from app.models.model import Model, ModelTask
from app.schemas.project import ProjectCreate

def is_compatible_project_dataset( project: Project, dataset: Dataset ) -> bool:
    COMPATIBLITY_MAPS = ((ProjectType.tabular_classification, DatasetType.tabular),
                         (ProjectType.tabular_regression, DatasetType.tabular,),
                         (ProjectType.timeseries_forecasting, DatasetType.timeseries_forecasting))
    return (project.project_type, dataset.dataset_type) in COMPATIBLITY_MAPS

def is_compatible_project_model( project: Project, model: Model ) -> bool:
    COMPATIBLITY_MAPS = ((ProjectType.tabular_classification, ModelTask.tabular_classification),
                         (ProjectType.tabular_regression, ModelTask.tabular_regression),
                         (ProjectType.timeseries_forecasting, ModelTask.timeseries_forecasting))
    return (project.project_type, model.task) in COMPATIBLITY_MAPS

def create_project(db: Session, project: ProjectCreate):
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_project(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()

def get_projects(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Project).offset(skip).limit(limit).all()

def add_dataset( db: Session, project_id: int, dataset_id: int):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    db_dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if db_project and db_dataset and is_compatible_project_dataset( db_project, db_dataset):
        db_project.dataset_id = dataset_id
        db.commit()
        db.refresh(db_project)
    return db_project

def add_model( db: Session, project_id: int, model_id: int):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    db_model = db.query(Dataset).filter(Dataset.id == model_id).first()
    if db_project and db_model and is_compatible_project_model( db_project, db_model):
        db_project.model_id = model_id
        db.commit()
        db.refresh(db_project)
    return db_project