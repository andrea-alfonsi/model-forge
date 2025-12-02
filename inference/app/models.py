import time
import random

class InferenceModel:
    def __init__(self, model_name: str):
        self.model_name = model_name
        # Simulate model loading time
        time.sleep(1)

    def predict(self, data: dict) -> dict:
        """Simulates a prediction."""
        start_time = time.time()
        # Simulate inference work
        time.sleep(random.uniform(0.05, 0.2))
        inference_time = time.time() - start_time
        
        return {
            "prediction": "some_result",
            "inference_time": inference_time
        }

# A simple cache for loaded models
_model_cache = {}

def get_model(model_name: str) -> InferenceModel:
    """Loads a model or retrieves it from cache."""
    if model_name not in _model_cache:
        print(f"Loading model: {model_name}")
        _model_cache[model_name] = InferenceModel(model_name)
    return _model_cache[model_name]
