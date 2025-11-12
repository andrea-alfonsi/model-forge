import importlib
from app.celery_app import celery_app

@celery_app.task(name="train_model", bind=True)
def train_model(self, job_id: int, model_id: int, dataset_id: int, configuration_json: dict):
    try:
        # Dynamically import the script from the local /app/scripts/ folder
        script_module = importlib.import_module(f"scripts.{model_id}")

        # All scripts must conform to a standard interface, e.g., a "run()" method
        result = script_module.run(dataset_id, configuration_json)

        return f"Successfully trained {model_id} with result: {result}"

    except ImportError:
        # This task will fail and retry (if configured)
        # This is correct behavior if a task for a non-existent model is somehow enqueued
        raise ValueError(f"Script for model_id '{model_id}' not found.")
    except Exception as e:
        # Handle training-specific errors
        raise self.retry(exc=e, countdown=60)