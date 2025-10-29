from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, func
from datetime import datetime
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class TrainingJob(Base):
    __tablename__ = "training_jobs"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    ended_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now(), server_onupdate=func.now())
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=True)

    project = relationship("Project", back_populates="training_jobs", uselist=False)
    model = relationship("Model", back_populates="traning_job", uselist=False)
