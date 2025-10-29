from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import project as crud
from app.schemas import project
from app.database import get_db

router = APIRouter(
    prefix="/projects",       # all endpoints start with /projects
    tags=["projects"],        # groups them in the docs
)

@router.get("/", response_model=List[project.ProjectRead])
async def list_projects(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_projects(db, skip=skip, limit=limit)

@router.get("/{project_id}", response_model=project.ProjectRead)
async def read_project(project_id: int, db: Session = Depends(get_db)):
    db_project = crud.get_project(db, project_id=project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@router.post("/create", response_model=project.ProjectRead)
async def create_project(project: project.ProjectCreate, db: Session = Depends(get_db)):
    return crud.create_project(db=db, project=project)

@router.post("/{project_id}/add_dataset/")
async def add_dataset_to_project(project_id: int, dataset_id: int, db: Session = Depends(get_db)):
    db_project = crud.add_dataset(db, project_id=project_id, dataset_id=dataset_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"result": "ok"}