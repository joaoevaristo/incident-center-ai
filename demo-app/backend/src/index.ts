import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { incidentsRoutes } from './routes/incidents';
import { tasksRoutes } from './routes/tasks';
import { messagesRoutes } from './routes/messages';
import { metricsRoutes } from './routes/metrics';
import { settingsRoutes } from './routes/settings';
import { simulatorRoutes } from './routes/simulator';
import { agentQueue } from './utils/queue';
import { processAgentJob } from './utils/queue';
import { shutdownOtel } from './utils/otel';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Register plugins
app.register(fastifyCors, { origin: true });
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Incident Center AI API',
      description: 'Multi-agent orchestration API for AI Ops incident management',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {},
    },
  },
});
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
  },
});

// Health check
app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}));

// Register routes
app.register(incidentsRoutes);
app.register(tasksRoutes);
app.register(messagesRoutes);
app.register(metricsRoutes);
app.register(settingsRoutes);
app.register(simulatorRoutes);

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    // Start agent job processors
    const workers = await Promise.all([
      processAgentJob('triage', async (job) => {
        // Triage agent logic
        return { agent: 'triage', result: 'triage complete' };
      }),
      processAgentJob('rca', async (job) => {
        // RCA agent logic
        return { agent: 'rca', result: 'rca complete' };
      }),
      processAgentJob('mitigation', async (job) => {
        // Mitigation agent logic
        return { agent: 'mitigation', result: 'mitigation complete' };
      }),
      processAgentJob('communication', async (job) => {
        // Communication agent logic
        return { agent: 'communication', result: 'communication complete' };
      }),
      processAgentJob('sre', async (job) => {
        // SRE agent logic
        return { agent: 'sre', result: 'sre complete' };
      }),
    ]);

    await app.listen({ port, host });
    app.log.info(`Server listening on http://${host}:${port}`);
    app.log.info(`API docs available at http://${host}:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  app.log.info('Shutting down...');
  await app.close();
  await agentQueue.close();
  await shutdownOtel();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
