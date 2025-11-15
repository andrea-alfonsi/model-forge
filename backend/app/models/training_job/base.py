from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, JSON, Enum
from datetime import datetime
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class Queues(enum.Enum):
    CPU = "cpu"
    T4 = "gpu_t4"


class TrainingJob(Base):
    __tablename__ = "training_jobs"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=True)
    hyperparameters = Column(JSON, nullable=False, default=dict)
    end_reason = Column(String, nullable=True)
    report = Column(String, nullable=True)
    queue = Column(Enum(Queues), nullable=False)

    dataset = relationship("Dataset", back_populates="training_jobs", uselist=False)
    model = relationship("Model", back_populates="training_job", uselist=False)
