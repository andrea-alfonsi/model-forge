from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from libforge.sql_base import Base
from libforge.models.tasks import ModelTask
from pydantic import BaseModel, Field

class TrainingJobHyperparameter(BaseModel):
    batch: int = Field(default=10, gt=0)

class Model(Base):
    __tablename__ = "models"
    __allow_unmapped__ = True
    __mapper_args__ = {
        "polymorphic_on": "kind",
        "polymorphic_identity": None
    }

    id = Column(Integer, primary_key=True, index=True)
    task = Column(Enum(ModelTask), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    size = Column(Integer, nullable=False, default=0)
    uri = Column(String, nullable=True)
    derived_from_id = Column(Integer, ForeignKey('models.id'), nullable=True)
    kind = Column(String, nullable=False)

    original_model = relationship(
            'Model',
            remote_side=[id], # The id column of *this* table is the "remote" side
            backref='derived_models' # Creates a 'derived_models' attribute on the parent
        )
    training_job = relationship("TrainingJob", back_populates="model", uselist=False)

    @staticmethod
    def training_hyperparameters() -> type[TrainingJobHyperparameter]:
        """
        Getter for the training parameters
        This will be overridden by subclasses (polymorphism).
        """
        # Return the base Info object
        return TrainingJobHyperparameter
