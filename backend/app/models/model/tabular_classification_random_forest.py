from pydantic import Field
from app.models.model.base import Model, TrainingJobHyperparameter


class RandomForestTrainingJobHyperparameter(TrainingJobHyperparameter):
    n_estimators: int = Field(default=100, json_schema_extra={"element": "range"})
    max_depth: int = Field(default=None)


class RandomForestForClassification(Model):
    __mapper_args__ = {
        "polymorphic_identity": 'RandomForestForClassification'
    }

    @staticmethod
    def training_hyperparameters() -> type[TrainingJobHyperparameter]:
        """
        Getter for the training parameters
        This will be overridden by subclasses (polymorphism).
        """
        return RandomForestTrainingJobHyperparameter