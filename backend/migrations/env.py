import sys
import os
import importlib.util 

# Import your Base and all model files
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

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# target_metadata is configured with your Base.metadata object
target_metadata = Base.metadata

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
