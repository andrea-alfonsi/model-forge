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

@app.task(name="models.train")
def train_model(job_id: int):
    return {"status": "success", "job_id": job_id}
