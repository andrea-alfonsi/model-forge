import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.instrumentation.celery import CeleryInstrumentor
from celery import Celery
from celery.signals import worker_process_init

def make_celery():

  trace.set_tracer_provider(TracerProvider())
  tracer_provider = trace.get_tracer_provider()


  jaeger_exporter = JaegerExporter(
      agent_host_name="jaeger",
      agent_port=6831,
  )
  span_processor = BatchSpanProcessor(jaeger_exporter)
  tracer_provider.add_span_processor(span_processor)

  # Instrument FastAPI and Logging
  @worker_process_init.connect(weak=False)
  def init_celery_tracing(*args, **kwargs):
      CeleryInstrumentor().instrument()
  LoggingInstrumentor().instrument(set_logging_format=True)


  broker_url = os.environ["CELERY_BROKER_URL"]
  backend_url = os.environ["CELERY_RESULT_BACKEND"]

  app = Celery("trainer", broker=broker_url, backend=backend_url)

  app.conf.update(
      task_serializer="json",
      result_serializer="json",
      accept_content=["json"],
      timezone="UTC",
      enable_utc=True,
  )
  return app





celery_app = make_celery()
celery_app.autodiscover_tasks(packages=["app.tasks"])