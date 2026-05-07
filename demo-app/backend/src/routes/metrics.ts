import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../utils/db';

export async function metricsRoutes(fastify: FastifyInstance) {
  // GET /api/incidents/:incidentId/metrics - List metrics for an incident
  fastify.get('/api/incidents/:incidentId/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    const { incidentId } = request.params as { incidentId: string };

    const metrics = await prisma.metricSnapshot.findMany({
      where: { incidentId },
      orderBy: { recordedAt: 'desc' },
    });

    return reply.send(metrics);
  });

  // POST /api/incidents/:incidentId/metrics - Create a metric snapshot
  fastify.post('/api/incidents/:incidentId/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    const { incidentId } = request.params as { incidentId: string };
    const body = request.body as {
      metricName: string;
      metricValue: number;
      metricType: string;
      labels?: Record<string, string>;
    };

    const metric = await prisma.metricSnapshot.create({
      data: {
        id: `metric-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        incidentId,
        metricName: body.metricName,
        metricValue: body.metricValue,
        metricType: body.metricType as any,
        labels: (body.labels || {}) as any,
      },
    });

    return reply.code(201).send(metric);
  });

  // GET /api/incidents/:incidentId/metrics/trend - Get metric trends
  fastify.get('/api/incidents/:incidentId/metrics/trend', async (request: FastifyRequest, reply: FastifyReply) => {
    const { incidentId } = request.params as { incidentId: string };
    const query = request.query as { metricName?: string; limit?: number };

    const where: Record<string, unknown> = { incidentId };
    if (query.metricName) where.metricName = query.metricName;

    const metrics = await prisma.metricSnapshot.findMany({
      where,
      orderBy: { recordedAt: 'asc' },
      take: query.limit || 100,
    });

    // Group by metricName for trend analysis
    const trends: Record<string, Array<{ value: number; timestamp: string }>> = {};
    for (const m of metrics) {
      if (!trends[m.metricName]) trends[m.metricName] = [];
      trends[m.metricName].push({ value: m.metricValue, timestamp: m.recordedAt });
    }

    return reply.send({ trends });
  });
}
