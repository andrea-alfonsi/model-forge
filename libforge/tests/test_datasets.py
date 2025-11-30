import pytest
import os
from libforge.datasets import Dataset, DatasetType
 
# Define the temporary directory from the environment, with a fallback
TMP_DIR = os.environ.get("GEMINI_TMP_DIR", "/tmp")
 
@pytest.fixture
def create_test_csv_file():
    """A pytest fixture to create temporary CSV files for testing."""
    test_files = []

    def _create_file(filename, content):
        filepath = os.path.join(TMP_DIR, filename)
        with open(filepath, "w") as f:
            f.write(content)
        test_files.append(filepath)
        return filepath

    yield _create_file

    # Teardown: remove created files
    for filepath in test_files:
        if os.path.exists(filepath):
            os.remove(filepath)

def test_dataset_initialization():
    """Tests the basic initialization of a Dataset object."""
    dataset = Dataset(
        name="Test Dataset",
        description="A test dataset.",
        type=DatasetType.tabular
    )
    assert dataset.name == "Test Dataset"
    assert dataset.is_active is True
    assert dataset.type == DatasetType.tabular

def test_validate_new_file_valid_csv_with_header(create_test_csv_file):
    """
    Tests validate_new_file with a valid CSV that includes a header.
    Checks for correct inference of row count, column names, and types.
    """
    content = "id,name,value\n1,item1,10.5\n2,item2,20\n"
    filepath = create_test_csv_file("valid_with_header.csv", content)
    
    dataset = Dataset(type=DatasetType.tabular, name="test")
    error = dataset.validate_new_file(filepath)

    assert error is None
    assert dataset.n_rows == 2
    assert dataset.columns == "id:integer,name:string,value:float"

def test_validate_new_file_valid_csv_no_header(create_test_csv_file):
    """
    Tests validate_new_file with a valid CSV that does not have a header.
    Checks that columns are given default names.
    """
    content = "1,item1,10.5\n2,item2,20\n"
    filepath = create_test_csv_file("valid_no_header.csv", content)

    dataset = Dataset(type=DatasetType.tabular, name="test")
    error = dataset.validate_new_file(filepath)

    assert error is None
    assert dataset.n_rows == 2
    assert dataset.columns == "col_1:integer,col_2:string,col_3:float"

def test_validate_new_file_empty_file(create_test_csv_file):
    """Tests validate_new_file with a completely empty file."""
    filepath = create_test_csv_file("empty.csv", "")
    
    dataset = Dataset(type=DatasetType.tabular, name="test")
    error = dataset.validate_new_file(filepath)
    
    assert error == "File is empty."

def test_validate_new_file_inconsistent_columns(create_test_csv_file):
    """
    Tests validate_new_file with a CSV file where rows have a different
    number of columns, which should result in an error.
    """
    content = "h1,h2\nval1,val2\nval3,val4,val5\n"
    filepath = create_test_csv_file("inconsistent.csv", content)

    dataset = Dataset(type=DatasetType.tabular, name="test")
    error = dataset.validate_new_file(filepath)
    
    assert "inconsistent column count" in error

def test_validate_new_file_non_tabular(create_test_csv_file):
    """
    Tests that validate_new_file returns no errors for non-tabular datasets
    as the validation logic is specific to tabular data.
    """
    content = "this is not a csv"
    filepath = create_test_csv_file("not_tabular.txt", content)
    
    dataset = Dataset(type=DatasetType.generic, name="test")
    error = dataset.validate_new_file(filepath)
    
    assert error is None

def test_dataset_info_property_tabular():
    """
    Tests the dataset_info property for a tabular dataset, ensuring it
    correctly parses the columns string into a structured format.
    """
    dataset = Dataset(
        type=DatasetType.tabular,
        n_rows=100,
        columns="id:integer,name:string,value:float"
    )
    info = dataset.dataset_info
    
    assert info.n_rows == 100
    assert len(info.columns) == 3
    assert info.columns[0] == {"name": "id", "type": "integer"}
    assert info.columns[1] == {"name": "name", "type": "string"}
    assert info.columns[2] == {"name": "value", "type": "float"}

def test_dataset_info_property_generic():
    """Tests the dataset_info property for a non-tabular (generic) dataset."""
    dataset = Dataset(type=DatasetType.generic)
    info = dataset.dataset_info
    
    assert not hasattr(info, "n_rows")
    assert not hasattr(info, "columns")