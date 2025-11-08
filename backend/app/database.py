from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os
import importlib
from app.models.base import Base

def import_all_models(models_path):
    """Dynamically imports all Python modules in a given directory."""
    
    # Ensure the project root is in the path
    sys.path.insert(0, os.path.abspath(".")) 

    # Determine the package name based on the models_path (e.g., 'app.models')
    # Assumes models_path is relative to the project root
    package_name = models_path.replace(os.sep, '.')
    
    print(f"Attempting to import models from package: {package_name}")

    # Iterate through all files in the models directory
    for filename in os.listdir(models_path):
        if filename.endswith(".py") and filename not in ("__init__.py", "base.py"):
            module_name = filename[:-3]  # Remove the .py extension
            full_module_name = f"{package_name}.{module_name}"
            
            try:
                # Import the module
                importlib.import_module(full_module_name)
                print(f"Successfully imported: {full_module_name}")
            except Exception as e:
                print(f"Could not import {full_module_name}. Error: {e}")

# Call the function with the relative path to your models directory.
# Assuming your models are in 'app/models/' relative to where you run alembic.
import_all_models('app/models')

DATABASE_URL = "postgresql+psycopg2://user:password@db:5432/mydb"

# Create engine with connection pool
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,
    echo=True
)

# Session factory
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()