import { Queue, Worker } from 'bullmq';
import { v4 as uuid } from 'uuid';
import prisma from './utils/db';
import { generateMockIncident } from './utils/mock-data';
import { initOtel, recordJobMetrics } from './utils/otel';

const QUEUE_NAME = 'simulation';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Initialize OpenTelemetry
initOtel();

// Create simulation queue
const simulationQueue = new Queue(QUEUE_NAME, {
  connection: {
    url: REDIS_URL,
  },
});

// Ensure queue is ready
await simulationQueue.waitUntilReady();

console.log('Simulation worker started');
console.log(`Queue: ${QUEUE_NAME}`);
console.log(`Redis: ${REDIS_URL}`);

// Create simulation job every 30 seconds
async function createSimulationJob() {
  const job = await simulationQueue.add('create-incident', {
    source: 'simulation',
    timestamp: new Date().toISOString(),
  }, {
    repeat: { every: 30000 }, // Every 30 seconds
    removeOnComplete: 10,
    removeOnFail: 20,
  });
  console.log(`[${new Date().toISOString()}] Created simulation job: ${job.id}`);
  return job;
}

// Process simulation job
async function processSimulationJob(job: any) {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Processing simulation job: ${job.id}`);

  try {
    // Generate mock incident
    const incident = generateMockIncident();

    // Create incident in database
    const created = await prisma.incident.create({
      data: {
        id: incident.id,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        source: incident.source as any,
        metadata: incident.metadata as any,
      },
    });

    console.log(`[${new Date().toISOString()}] Created incident: ${created.id}`);

    // Record job metrics
    const duration = Date.now() - startTime;
    recordJobMetrics('simulation', 'create-incident', duration, true);

    return { incidentId: created.id, success: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    recordJobMetrics('simulation', 'create-incident', duration, false);
    console.error(`[${new Date().toISOString()}] Job failed:`, error);
    throw error;
  }
}

// Start job processor
const worker = new Worker(QUEUE_NAME, processSimulationJob as any, {
  connection: {
    url: REDIS_URL,
  },
  concurrency: 3,
  limiter: {
    max: 5,
    duration: 10000, // Max 5 jobs per 10 seconds
  },
});

worker.on('completed', (job) => {
  console.log(`[${new Date().toISOString()}] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[${new Date().toISOString()}] Job ${job?.id} failed:`, err.message);
});

// Start periodic job creation
await createSimulationJob();
setInterval(createSimulationJob, 30000);

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down simulation worker...');
  await worker.close();
  await simulationQueue.close();
  console.log('Simulation worker stopped');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
