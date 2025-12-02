from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import database
import models

app = FastAPI(title="Python Inference Server")

# Dependency to get a DB session
def get_db_session():
    with database.get_session() as session:
        yield session

@app.on_event("startup")
def on_startup():
    database.init_db()

@app.post("/predict/{model_name}")
def predict(model_name: str, data: dict, db: Session = Depends(get_db_session)):
    """Runs a prediction and logs metrics."""
    model = models.get_model(model_name)
    result = model.predict(data)
    
    # Log metrics
    database.log_metric(
        session=db,
        model_name=model_name,
        inference_time=result["inference_time"]
    )
    
    return {"prediction": result["prediction"]}

@app.get("/metrics/{model_name}")
def get_model_metrics(model_name: str, db: Session = Depends(get_db_session)):
    """Retrieves all logged metrics for a specific model."""
    metrics = database.get_metrics(session=db, model_name=model_name)
    return metrics
