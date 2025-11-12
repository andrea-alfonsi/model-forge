from app.models.model.base import Model, ModelTask

class RandomForestForClassification(Model):
    __mapper_args__ = {
        "polymorphic_identity": ModelTask.tabular_classification
    }

    @staticmethod
    def training_config():
        """
        Getter for the training parameters
        This will be overridden by subclasses (polymorphism).
        """
        # Return the base Info object
        return { 'estimators': 200 }