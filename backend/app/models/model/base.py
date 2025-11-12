from sqlalchemy import Column, Integer, String, Enum, DateTime, func, ForeignKey
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
    __allow_unmapped__ = True
    __mapper_args__ = {
        "polymorphic_on": "task",
        "polymorphic_identity": None
    }

    id = Column(Integer, primary_key=True, index=True)
    task = Column(Enum(ModelTask), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    size = Column(Integer, nullable=False, default=0)
    uri = Column(String, nullable=True)
    derived_from_id = Column(Integer, ForeignKey('models.id'), nullable=True)

    original_model = relationship(
            'Model',
            remote_side=[id], # The id column of *this* table is the "remote" side
            backref='derived_models' # Creates a 'derived_models' attribute on the parent
        )
    training_job = relationship("TrainingJob", back_populates="model", uselist=False)

    @staticmethod
    def training_config():
        """
        Getter for the training parameters
        This will be overridden by subclasses (polymorphism).
        """
        # Return the base Info object
        return dict()
