from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, func
from sqlalchemy.orm import relationship
from datetime import datetime
import enum 
from app.models.base import Base

class DatasetType(enum.Enum):
    tabular = "tabular"
    image_classification = "image_classification"
    image_segmentation = "image_segmentation"
    text_classification = "text_classification"
    text_generation = "text_generation"
    audio_classification = "audio_classification"
    audio_generation = "audio_generation"
    timeseries_forecasting = "timeseries_forecasting"

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now(), server_onupdate=func.now())
    dataset_type = Column(Enum(DatasetType), nullable=False)
    
    project = relationship("Project", back_populates="dataset")