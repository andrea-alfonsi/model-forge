from enum import Enum
from typing import Union
from app.models.model.tabular_classification_random_forest import RandomForestTrainingJobHyperparameter, RandomForestForClassification

class ModelsAvailable(Enum):
  RandomForestForClassification = RandomForestForClassification.__name__

  @staticmethod
  def get_class( name: str ):
    if name == ModelsAvailable.RandomForestForClassification:
      return RandomForestForClassification
    raise ValueError(f"No class for {name}")


Hyperpamerters = Union[RandomForestTrainingJobHyperparameter]