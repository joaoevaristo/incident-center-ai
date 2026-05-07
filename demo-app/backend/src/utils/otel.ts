import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { diag, DiagLogLevel, DiagConsoleLogger } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'incident-center-backend',
  [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
});

const exporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/metrics',
});

const reader = new PeriodicExportingMetricReader({
  exporter,
  exportIntervalMillis: 5000,
});

const meterProvider = new MeterProvider({ resource, readers: [reader] });

export const meter = meterProvider.getMeter('incident-center');

export function getMetric(name: string, description: string, unit: string = '1') {
  const existing = meter.getObservableGauges().find((g) => g.name === name);
  if (existing) return existing;
  return meter.createObservableGauge(name, { description, unit });
}

export async function shutdownOtel() {
  await meterProvider.shutdown();
}
