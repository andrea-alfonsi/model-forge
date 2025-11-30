from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from datetime import datetime
from typing import Optional, List
from libforge.sql_base import Base
 
class Dataset(Base):
    """
    SQLAlchemy model for a dataset.

    This model represents a single dataset in the database and includes metadata
    and information required for creating normalized tables, particularly for tabular datasets.
    """
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True, doc="Unique identifier for the dataset.")
    name = Column(String, nullable=False, doc="Name of the dataset.")
    description = Column(String, nullable=True, doc="A description of the dataset.")
    is_active = Column(Boolean, default=True, doc="Whether the dataset is active and available for use.")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now(), doc="Timestamp of when the dataset was created.")
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now(), server_onupdate=func.now(), doc="Timestamp of when the dataset was last updated.")
    uri = Column(String, nullable=True, doc="URI pointing to the dataset's storage location.")

    n_rows = Column(Integer, nullable=True, doc="Number of rows in the tabular dataset.")
    columns = Column(String, nullable=True, doc="Comma-separated list of column names and their inferred types (e.g., 'col1:int,col2:str').")
    features = Column(String, nullable=True, doc="Comma-separated list of columns to be used as features.")
    labels = Column(String, nullable=True, doc="Comma-separated list of columns to be used as labels.")

    # Uncomment the following lines when the TrainingJob model is defined
    # training_jobs = relationship("TrainingJob", back_populates="dataset")

    @property
    def dataset_info(self):
        """
        Returns a DatasetInfo object. The dataset info is responsible for sharing common properties through API independently form the storage
        """
        


    def validate_new_file(self, tmp_path: str) -> Optional[str]:
        """
        Validates a new file for a tabular dataset.

        This method checks for consistency in column count, infers column types,
        and sets the model's attributes based on the file content.

        Args:
            tmp_path: The path to the temporary file to validate.

        Returns:
            A string with an error message if validation fails, otherwise None.
        """

        import csv

        def is_int(s):
            try:
                if '.' in s: 
                    return False
                int(s)
                return True
            except ValueError:
                return False

        def is_float(s):
            try:
                float(s)
                return True
            except ValueError:
                return False

        def _infer_single_value_type(value: str) -> str:
            v = value.strip()
            if not v:
                return "string" 
            if is_int(v):
                return "integer"
            elif is_float(v):
                return "float"
            else:
                return "string"

        def _reconcile_types(existing_type: str, new_type: str) -> str:
            # Logic: integer -> float -> string
            if existing_type == new_type: return existing_type
            if (existing_type == "integer" and new_type == "float") or (existing_type == "float" and new_type == "integer"):
                return "float"
            if new_type == "string" or existing_type == "string":
                return "string"
            return "string" # Default fallback

        try:
            # 1. Header Detection
            with open(tmp_path, 'r', newline='', encoding='utf-8') as f:
                sample = f.read(1024)
                if not sample.strip():
                    return "File is empty."
                has_header = csv.Sniffer().has_header(sample)

            # 2. Main Processing Pass
            with open(tmp_path, 'r', newline='', encoding='utf-8') as file:
                reader = csv.reader(file)
                
                # --- Initializing Schema Variables ---
                column_types: List[str] = []
                column_names: List[str] = []
                data_row_count = 0
                
                # 2a. Process Header/First Row
                try:
                    first_row = next(reader)
                    column_count = len(first_row)
                    column_types = ["integer"] * column_count 
                    
                    if has_header:
                        column_names = first_row
                    else:
                        column_names = [f"col_{i+1}" for i in range(column_count)]
                        # If no header, the first row is data, so infer its types
                        for i, value in enumerate(first_row):
                            column_types[i] = _infer_single_value_type(value)
                        data_row_count = 1
                        
                except StopIteration:
                    return "File is empty or contains only non-data characters."

                # --- Core Validation & Type Inference Loop ---
                for row_number, row in enumerate(reader, start=1 if has_header else 2):
                    if len(row) == 0:
                        continue

                    data_row_count += 1
                    
                    # Check 1: Column Count Consistency
                    if len(row) != column_count:
                        return f"Row {data_row_count} has inconsistent column count. Expected {column_count}, Found {len(row)}."
                        
                    # Check 2: Type Refinement
                    for i, value in enumerate(row):
                        value_type = _infer_single_value_type(value)
                        column_types[i] = _reconcile_types(column_types[i], value_type)
                        
                # --- Final Schema Processing ---
                schema_parts = [f"{name}:{ctype}" for name, ctype in zip(column_names, column_types)]
                
                # 3. Set Model Attributes
                self.n_rows = data_row_count
                self.columns = ",".join(schema_parts)
                
                # 4. Final Validation (e.g., minimum rows)
                if self.n_rows == 0:
                    return "The file contains headers but no data rows."
                    
        except FileNotFoundError:
            return f"Validation failed: Temporary file not found at {tmp_path}"
        except Exception as e:
            return f"An unexpected processing error occurred: {e}"

        # Success
        return None