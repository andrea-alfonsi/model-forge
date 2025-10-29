from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, func
from datetime import datetime
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class ProjectType(enum.Enum):
    tabular_classification = "tabular_classification"
    tabular_regression = "tabular_regression"
    timeseries_forecasting = "timeseries_forecasting"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now(), server_onupdate=func.now())
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    project_type = Column(Enum(ProjectType), nullable=False)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=True)

    dataset = relationship("Dataset", back_populates="project", uselist=False)
    model = relationship("Model", back_populates="project")
    training_jobs = relationship("TrainingJob", back_populates="project")
