import enum

class ModelTask(enum.Enum):
    tabular_classification = "tabular_classification"
    tabular_regression = "tabular_regression"
    timeseries_forecasting = "timeseries_forecasting"
