from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, func, JSON
from datetime import datetime
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class TrainingJob(Base):
    __tablename__ = "training_jobs"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    end_reason = Column(String, nullable=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=True)
    hyperparameters = Column(JSON, nullable=False, default=dict)
    report = Column(String, nullable=True)

    dataset = relationship("Dataset", back_populates="training_jobs", uselist=False)
    model = relationship("Model", back_populates="training_job", uselist=False)
