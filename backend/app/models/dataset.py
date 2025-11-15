from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, func, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict
import enum 
from app.models.base import Base

class DatasetInfo(BaseModel):
    pass

class TabularDatasetInfo(DatasetInfo):
    n_rows: Optional[int]
    columns: List[Dict[str, str]]

class DatasetType(enum.Enum):
    generic = "generic"
    tabular = "tabular"
    image_classification = "image_classification"
    image_segmentation = "image_segmentation"
    text_classification = "text_classification"
    text_generation = "text_generation"
    audio_classification = "audio_classification"
    audio_generation = "audio_generation"
    timeseries_forecasting = "timeseries_forecasting"

class Dataset(Base):
    __tablename__ = "datasets"
    __allow_unmapped__ = True
    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": DatasetType.generic
    }

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now(), server_onupdate=func.now())
    type = Column(Enum(DatasetType), nullable=False)
    uri = Column(String, nullable=True)
    
    training_jobs = relationship("TrainingJob", back_populates="dataset")

    @property
    def dataset_info(self):
        """
        Getter for the computed DatasetInfo object.
        This will be overridden by subclasses (polymorphism).
        """
        # Return the base Info object
        return DatasetInfo()

    def validate_new_file( self, tmp_path: str ) -> Optional[str]:
        """
        Returns the string with the errors ora None if everything is fine.
        Also should set additional varaibles. The mmodelwill not be saved unless the file is okay, so no probelm in setting db values
        tmp_path indicates where the file is stored before finalizing the save if operation is successful, if fails the file canbe discarded
        """
        return None


class TabularDataset(Dataset):
    __tablename__ = "tabular_datasets"
    __mapper_args__ = {
        "polymorphic_identity": DatasetType.tabular
    }
    id: Optional[int] = Column(
        Integer,
        ForeignKey("datasets.id"), 
        primary_key=True
    )
    n_rows: Optional[int] = Column(Integer, nullable=True )
    columns: Optional[str] = Column(String, nullable=True )
    features: Optional[str] = Column(String, nullable=True )
    labels: Optional[str] = Column(String, nullable=True )

    @property
    def dataset_info(self):
        """
        Getter for the computed TabularDatasetInfo object.
        """
        schema_data = []
        if self.columns:
            schema_data = [
                {'name': col_type.split(':')[0], 'type': col_type.split(':')[1]}
                for col_type in self.columns.split(',')
            ]
        return TabularDatasetInfo(
            columns=schema_data,
            n_rows=self.n_rows
        )


    def validate_new_file( self, tmp_path: str ) -> Optional[str]:
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
                        
                    # Check 3 (Example Custom Validation): Ensure a column named 'id' is present and is an integer.
                    # This check is difficult to perform robustly without knowing the final type, 
                    # but if you need an early-exit on critical columns:
                    if "id" in column_names:
                        id_index = column_names.index("id")
                        if not is_int(row[id_index]):
                           pass # Will be caught by final type check, but could return error here.

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


