from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.routers import dataset, model
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor

app = FastAPI(
    title="AutoTrain Backend Service",
    description="Backend service for managing datasets, projects, and models in AutoTrain.",
    version="1.0.0",
)
app.include_router(dataset.router)
app.include_router(model.router)

origins = [
    "*", # Allows ALL origins. Be CAREFUL with this in Production!
    # "http://localhost:3000", # Example for a specific React dev server
    # "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Allow cookies/authentication headers
    allow_methods=["*"],    # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],    # Allow all headers (Authorization, Content-Type, etc.)
)


# Configure OpenTelemetry Tracer
trace.set_tracer_provider(TracerProvider())
tracer_provider = trace.get_tracer_provider()


jaeger_exporter = JaegerExporter(
    agent_host_name="jaeger",
    agent_port=6831,
)
span_processor = BatchSpanProcessor(jaeger_exporter)
tracer_provider.add_span_processor(span_processor)

# Instrument FastAPI and Logging
FastAPIInstrumentor.instrument_app(app, tracer_provider=tracer_provider)
LoggingInstrumentor().instrument(set_logging_format=True)


@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def index():
    return "Server is up and running"