import importlib
import pkgutil
import inspect
from enum import Enum

def get_classes_from_package(package_name: str, exclude: list[str] = None):
    """
    Dynamically import all modules in a package and collect class names.
    """
    exclude = exclude or []
    package = importlib.import_module(package_name)
    classes = {}

    # Iterate through all modules in the package
    for _, module_name, _ in pkgutil.iter_modules(package.__path__):
        module = importlib.import_module(f"{package_name}.{module_name}")
        for name, obj in inspect.getmembers(module, inspect.isclass):
            # Only include classes defined in this module (not imported ones)
            if obj.__module__ == module.__name__ and name not in exclude:
                classes[name] = name
    return classes

def build_model_enum(package_name: str, exclude: list[str] = None):
    classes = get_classes_from_package(package_name, exclude)
    return Enum("ModelName", classes)

AllModelsEnum = build_model_enum("app.models.model", exclude=["Model", "ModelTask"]) # Can add deprected here too