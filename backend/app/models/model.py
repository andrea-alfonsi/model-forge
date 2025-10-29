from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime, func
from datetime import datetime
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class ModelTask(enum.Enum):
    tabular_classification = "tabular_classification"
    tabular_regression = "tabular_regression"
    timeseries_forecasting = "timeseries_forecasting"


class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now(), server_onupdate=func.now())
    task = Column(Enum(ModelTask), nullable=False)
    size = Column(Integer, nullable=False, default=0)
    
    project = relationship("Project", back_populates="model", uselist=False)
    training_job = relationship("TrainingJob", back_populates="model", uselist=False)