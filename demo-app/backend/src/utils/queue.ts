import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

export const agentQueue = new Queue('agent-tasks', { connection });

export async function processAgentJob(jobName: string, handler: (job: any) => Promise<any>) {
  const worker = new Worker('agent-tasks', async (job) => {
    try {
      const result = await handler(job);
      return result;
    } catch (error) {
      throw error;
    }
  }, { connection });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

export async function closeQueue() {
  await agentQueue.close();
  await connection.quit();
}
