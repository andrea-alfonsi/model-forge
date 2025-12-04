import os
import sys
import json
import importlib
import torch
import torch.nn as nn
import time
import threading
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Any, Dict

# Add the app directory to the python path to allow for absolute imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# --- Configuration ---
# Models are in a directory named 'models' at the project root.
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models'))
UNLOAD_TIMEOUT = 60 * 10

# --- Global State ---
app = FastAPI(title="Anemone Model Forge - Model Server")
available_models: Dict[str, Dict[str, str]] = {}
loaded_models: Dict[str, Dict[str, Any]] = {}

# --- Pydantic Models ---
class PredictRequest(BaseModel):
    data: List[Any]

class ExplainRequest(BaseModel):
    explainer: str
    data: List[Any]

# --- Core Logic ---

def discover_models():
    """Scans the model directory for models and updates the available_models mapping."""
    global available_models
    if not os.path.exists(MODEL_DIR):
        print(f"Model directory '{MODEL_DIR}' not found.")
        return

    discovered = {}
    for model_name in os.listdir(MODEL_DIR):
        model_path = os.path.join(MODEL_DIR, model_name)
        if not os.path.isdir(model_path):
            continue

        pytorch_model_path = os.path.join(model_path, "model.pt")
        config_path = os.path.join(model_path, "config.json")

        if os.path.exists(pytorch_model_path) and os.path.exists(config_path):
            discovered[model_name] = {
                "model_path": pytorch_model_path,
                "config_path": config_path
            }
    available_models = discovered
    print(f"Discovered models: {list(available_models.keys())}")


def get_model(model_name: str):
    """
    Gets a model from the loaded_models cache or loads it from disk.
    """
    if model_name in loaded_models:
        loaded_models[model_name]["last_access"] = time.time()
        return loaded_models[model_name]

    if model_name not in available_models:
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found.")

    model_info = available_models[model_name]
    
    try:

        # DEMO
        class SimpleClassifier(nn.Module):
            def __init__(self, input_size, num_classes):
                super().__init__()
                self.layer_stack = nn.Sequential(
                    nn.Linear(input_size, 32),
                    nn.ReLU(),
                    nn.Linear(32, 16),
                    nn.ReLU(),
                    nn.Linear(16, num_classes)
                )

            def forward(self, x):
                return self.layer_stack(x)

        # 2. Create Dummy Data
        N_SAMPLES = 100
        N_FEATURES = 5
        N_CLASSES = 3

        model = SimpleClassifier(N_FEATURES, N_CLASSES)

        # Load model
        state_dict = torch.load(model_info["model_path"])
        model.load_state_dict(state_dict)
        model.eval()

        # Load config
        with open(model_info["config_path"], 'r') as f:
            config = json.load(f)

        # Load explainers
        explainers = {}
        if "explainers" in config:
            for explainer_name in config["explainers"]:
                try:
                    explainer_module = importlib.import_module(f"explainers.{explainer_name}")
                    if hasattr(explainer_module, 'explain'):
                        explainers[explainer_name] = explainer_module.explain
                except ImportError:
                    print(f"Warning: could not import explainer '{explainer_name}' for model '{model_name}'.")

        loaded_models[model_name] = {
            "model": model,
            "config": config,
            "explainers": explainers,
            "last_access": time.time()
        }
        print(f"Loaded model '{model_name}'.")
        return loaded_models[model_name]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading model '{model_name}': {e}")


def unload_inactive_models():
    """Periodically checks for inactive models and unloads them."""
    while True:
        now = time.time()
        to_unload = [
            name for name, data in loaded_models.items()
            if now - data["last_access"] > UNLOAD_TIMEOUT
        ]
        for name in to_unload:
            print(f"Unloading inactive model {name}")
            del loaded_models[name]
        time.sleep(10)


# --- FastAPI Events ---

@app.on_event("startup")
async def startup_event():
    """On startup, discover models and start the background thread for unloading."""
    discover_models()
    # Start a thread to watch for file system changes to rediscover models
    threading.Thread(target=unload_inactive_models, daemon=True).start()

# --- API Endpoints ---

@app.get("/models")
async def get_models_list():
    """Get a list of available models and their configs."""
    discover_models() # Refresh on each request to get latest models
    model_info = []
    for model_name, paths in available_models.items():
        try:
            with open(paths['config_path'], 'r') as f:
                config = json.load(f)
                config['name'] = model_name
                if model_name in loaded_models:
                    config['status'] = 'loaded'
                    config['available_explainers'] = list(loaded_models[model_name].get("explainers", {}).keys())
                else:
                    config['status'] = 'available'
                model_info.append(config)
        except Exception as e:
            print(f"Could not read config for {model_name}: {e}")
            
    return model_info


@app.post("/predict/{model_name}")
async def predict(model_name: str, request: PredictRequest):
    """Make a prediction using a specified model."""

    model_data = get_model(model_name)
    model = model_data["model"]
    
    try:
        tensor_data = torch.tensor(request.data)
        predictions = await asyncio.to_thread(model, tensor_data)
        return {"predictions": predictions.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/explain/{model_name}")
async def explain(model_name: str, request: ExplainRequest):

    """Get an explanation for a prediction."""
    model_data = get_model(model_name)
    model = model_data["model"]
    
    if request.explainer not in model_data["explainers"]:
        raise HTTPException(status_code=404, detail=f"Explainer '{request.explainer}' not available for model '{model_name}'")
        
    explainer_func = model_data["explainers"][request.explainer]
    
    try:
        import json
        tensor_data = torch.tensor(request.data)
        explanation = await asyncio.to_thread(explainer_func, model, tensor_data)
        return {
            "attributions": json.dumps([e.tolist() for e in explanation.get("attributions", [])]) if explanation.get("attributions") is not None else None,
            "baseline": json.dumps(explanation.get("baseline", None).tolist()) if explanation.get("baseline") is not None else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during explanation: {e}")


if __name__ == "__main__":
    import uvicorn
    # To run this, use uvicorn from the 'modelserve' directory:
    # uvicorn app.main:app --reload
    print("Starting server. Assumes 'uvicorn app.main:app' is run from 'modelserve' directory.")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)