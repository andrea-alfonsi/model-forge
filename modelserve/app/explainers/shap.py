# Example Model Explainer using Captum
import torch
import torch.nn as nn
from captum.attr import IntegratedGradients
import numpy as np

def explain(model: torch.nn.Module, data: torch.Tensor, background_samples: int = 10) -> dict:
    """
    Generates a model explanation for the given PyTorch model and data using Captum's Integrated Gradients (IG).

    Integrated Gradients is a path-based method suitable for deep learning models.
    It integrates the gradients along the path from a baseline input to the actual input.
    The resulting attributions show how much each feature contributed to the final prediction.

    Args:
        model: The trained PyTorch model (nn.Module).
        data: The torch.Tensor input data to be explained.
        background_samples: The number of samples from 'data' to use to compute the baseline (average of these samples).

    Returns:
        A dictionary containing the generated attributions.
        - 'attributions': A list of numpy arrays, one for each model output class.
        - 'baseline': The numpy array of the computed baseline input.
    """

    # 1. Prepare Baseline Data
    if data.shape[0] < background_samples:
        print(f"Warning: Data shape ({data.shape[0]}) is less than requested background samples ({background_samples}). Using all data for baseline calculation.")
        baseline_data_source = data
    else:
        # Use a small, representative sample to compute the baseline (average input)
        baseline_data_source = data[:background_samples]
    
    # Calculate the mean of the background data as the baseline
    # This tensor will have shape (1, N_FEATURES)
    baseline = torch.mean(baseline_data_source, dim=0, keepdim=True)

    try:
        # Set the model to evaluation mode
        model.eval()

        # 2. Initialize Integrated Gradients
        ig = IntegratedGradients(model)

        # Determine number of output classes dynamically
        with torch.no_grad():
            num_classes = model(data[:1]).shape[1]
        
        # 3. Compute Attributions for all classes
        all_class_attributions = []
        for target_class in range(num_classes):
            # Compute attributions for each class output
            # target=index specifies the output index to attribute to.
            # The result is a tensor of shape (N_SAMPLES, N_FEATURES)
            attributions_for_class = ig.attribute(data, baselines=baseline, target=target_class)
            
            # Convert to numpy and add to the list
            all_class_attributions.append(attributions_for_class.detach().cpu().numpy())

        return {
            "attributions": all_class_attributions,
            "baseline": baseline.detach().cpu().numpy()
        }

    except Exception as e:
        return {"error": str(e), "attributions": None, "baseline": None}


# --- Example Usage ---
if __name__ == "__main__":


    # 1. Define a Dummy PyTorch Model
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

    # Create random input data
    dummy_data = torch.randn(N_SAMPLES, N_FEATURES, dtype=torch.float32)

    # 3. Instantiate Model and Explainer
    dummy_model = SimpleClassifier(N_FEATURES, N_CLASSES)
    MODEL_PATH = '/models/dummy_tabular_classificator/model.pt'
    torch.save(dummy_model.state_dict(), MODEL_PATH)
    with open('/models/dummy_tabular_classificator/config.json', 'w') as f:
        import json
        f.write(json.dumps( {
            "explainers": {"shap": {}}
        }))
    print(f"\nModel state dictionary successfully saved to {MODEL_PATH}")

    # Perform the explanation
    explanation_results = explain(dummy_model, dummy_data, background_samples=20)

    # 4. Display Results
    if explanation_results.get("attributions") is not None:
        attributions = explanation_results["attributions"]
        baseline = explanation_results["baseline"]

        print("\n--- Summary of Results (Captum Integrated Gradients) ---")
        print(f"Model Output Classes Explained: {len(attributions)}")
        print(f"Baseline Input (Mean of background data): {baseline[0]}")

        # For the first output class:
        print("\nFirst 3 attribution samples for the First Output Class (Feature contributions):")
        # Attributions shape: (N_CLASSES, N_SAMPLES, N_FEATURES)
        print(attributions[0][:3])