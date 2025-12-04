import torch
import os
from fastapi import FastAPI
from pydantic import BaseModel
import time, threading, asyncio
from captum.attr import Saliency, IntegratedGradients

app = FastAPI()

# --- Configuration ---
MODEL_DIR = "models"
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)
UNLOAD_TIMEOUT = 60  # seconds

# --- Global State ---
loaded_models = {}
last_access = {}
MODEL_PATHS = {} # Initialize as empty, will be populated on first discovery/load

# --- Core Logic Functions ---

def discover_models(model_dir):
    """Scans the directory for .pt files and updates the global MODEL_PATHS."""
    global MODEL_PATHS # Ensure we are modifying the global dictionary
    
    new_paths = {}
    for filename in os.listdir(model_dir):
        if filename.endswith(".pt"):
            model_name = filename[:-3] # Remove .pt
            new_paths[model_name] = os.path.join(model_dir, filename)
            
    # Update the global map with the newly discovered models
    # This overwrites the map entirely with the current state of the directory
    MODEL_PATHS = new_paths
    return MODEL_PATHS


class InputData(BaseModel):
    inputs: list
    compute_gradients: bool = False
    method: str = "saliency"


def load_model(name):
    """
    Attempts to load a model. Before loading, it refreshes the model list
    to ensure new models are detected.
    """
    # 1. Refresh the list of available models from the file system
    current_paths = discover_models(MODEL_DIR) 
    
    # 2. Check if the requested model is now available
    if name not in current_paths:
        raise ValueError(
            f"Model {name} not found. Available models: {list(current_paths.keys())}"
        )
    
    # 3. Load the model
    model_path = current_paths[name]
    if not os.path.exists(model_path):
        # This check is mostly redundant if discover_models works, but is a good safeguard
        raise FileNotFoundError(f"Model file not found at path: {model_path}")

    print(f"Loading model {name} from {model_path}")
    model = torch.load(model_path)
    model.eval()
    
    # 4. Update state and return
    loaded_models[name] = model
    last_access[name] = time.time()
    return model


def unload_inactive_models():
    # This remains the same as it manages memory of ALREADY loaded models
    while True:
        now = time.time()
        to_unload = [
            name for name, last in last_access.items()
            if now - last > UNLOAD_TIMEOUT
        ]
        for name in to_unload:
            print(f"Unloading {name}")
            del loaded_models[name]
            del last_access[name]
        time.sleep(10)

threading.Thread(target=unload_inactive_models, daemon=True).start()

# The rest of the functions (run_prediction, predict, status) remain the same.

def run_prediction(model, data: InputData):
    x = torch.tensor(data.inputs, dtype=torch.float32).unsqueeze(0)
    x.requires_grad = data.compute_gradients
    y = model(x)

    result = {"prediction": y.detach().numpy().tolist()}

    if data.compute_gradients:
        if data.method == "saliency":
            attr = Saliency(model)
            grads = attr.attribute(x).detach().numpy().tolist()
        elif data.method == "integrated_gradients":
            attr = IntegratedGradients(model)
            grads = attr.attribute(x, n_steps=50).detach().numpy().tolist()
        else:
            raise ValueError(f"Unknown attribution method: {data.method}")
        result["gradients"] = grads

    return result

@app.post("/predict/{model_name}")
async def predict(model_name: str, data: InputData):
    model = loaded_models.get(model_name)
    if model is None:
        try:
            model = load_model(model_name)
        except ValueError as e:
            return str(e)
    last_access[model_name] = time.time()

    result = await asyncio.to_thread(run_prediction, model, data)
    return result

@app.get("/status")
async def status():
    # Calling discover_models ensures the status endpoint returns the most current list of files
    current_available = discover_models(MODEL_DIR) 
    return {
        "loaded_models": list(loaded_models.keys()),
        "available_models": list(current_available.keys()),
    }