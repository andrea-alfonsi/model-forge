import os
from celery import Celery

broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
backend_url = os.getenv("CELERY_RESULT_BACKEND", "db+postgresql+psycopg2://user:password@db:5432/mydb")

app = Celery("trainer", broker=broker_url, backend=backend_url)

app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)


@app.task(name="tasks.train")
def train_model(model_uri: str, dataset_uri: str, training_options: dict, job_id: int):
    return {"status": "success", "model_uri": model_uri, "dataset_uri": dataset_uri, "training_options": training_options, "job_id": job_id}
