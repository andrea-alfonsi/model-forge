import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { BatchSpanProcessor, ConsoleSpanExporter, getResource, SimpleSpanProcessor, WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';

const provider = new WebTracerProvider({
  resource: resourceFromAttributes({
    'service.name': import.meta.env.VITE_SERVICE_NAME ?? 'frontend'
  }),
  spanProcessors: import.meta.env.VITE_OTEL_URL ? 
    [new BatchSpanProcessor(new OTLPTraceExporter({url: import.meta.env.VITE_OTEL_URL}))] : 
    [new SimpleSpanProcessor(new ConsoleSpanExporter())]
});
console.log( import.meta.env.VITE_OTEL_URL ) 

provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [
    // getWebAutoInstrumentations initializes all the package.
	// it's possible to configure each instrumentation if needed.
    getWebAutoInstrumentations({
      '@opentelemetry/instrumentation-fetch': {
			// config can be added here for example 
			// we can initialize the instrumentation only for prod
			// enabled: import.meta.env.PROD,		
      },
    }),
  ],
});

export function getTracer( name ){
  return tracer.getTracer( name )
}
export function traceFunction( name, fn ){
  return async (...args) => {
    const span = tracer.startSpan(name, {
      attributes: { "fn.args.count": args.length }
    });
    const ctx = trace.setSpan(context.active(), span);

    try {
      const result = await context.with(ctx, () => fn(...args));
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (e) {
      span.recordException(e);
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
      throw e;
    } finally {
      span.end();
    }
  };
}