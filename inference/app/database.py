import os
from contextlib import contextmanager
from typing import Generator
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
import datetime
import logging

logger = logging.getLogger(__name__)

# Define the database path in the data directory
DB_PATH = "/data/inference_metrics.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Make sure the directory for the database exists
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Metric(Base):
    __tablename__ = "metrics"
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True)
    inference_time = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    # Add other metrics as needed
    some_other_metric = Column(Float, default=0.0)

def init_db():
    """Initialize the database and create tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Metrics database tables created successfully.")
    except Exception as e:
        logger.exception(f"Error initializing metrics tables: {e}")

@contextmanager
def get_session() -> Generator[Session, None, None]:
    """Get a database session with automatic cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def log_metric(session: Session, model_name: str, inference_time: float, some_other_metric: float = 0.0):
    """Logs an inference metric to the database."""
    metric = Metric(
        model_name=model_name,
        inference_time=inference_time,
        some_other_metric=some_other_metric
    )
    session.add(metric)
    session.commit()

def get_metrics(session: Session, model_name: str):
    """Gets metrics for a given model, grouped by day."""
    from sqlalchemy import func

    results = (
        session.query(
            func.date(Metric.timestamp).label("date"),
            func.count(Metric.id).label("number_of_calls"),
        )
        .filter(Metric.model_name == model_name)
        .group_by(func.date(Metric.timestamp))
        .all()
    )

    return [{"date": result.date, "number_of_calls": result.number_of_calls} for result in results]
