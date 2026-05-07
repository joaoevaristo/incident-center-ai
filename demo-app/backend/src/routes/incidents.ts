import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../utils/db';
import { generateMockIncident } from '../utils/mock-data';

export async function incidentsRoutes(fastify: FastifyInstance) {
  // GET /api/incidents - List all incidents with pagination and filters
  fastify.get('/api/incidents', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as {
      page?: number;
      limit?: number;
      severity?: string;
      status?: string;
      source?: string;
      search?: string;
    };

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.severity) where.severity = query.severity;
    if (query.status) where.status = query.status;
    if (query.source) where.source = query.source;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          tasks: { select: { agentName: true, status: true, createdAt: true } },
          messages: { select: { agentName: true, channel: true, createdAt: true } },
          _count: { select: { tasks: true, messages: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.incident.count({ where }),
    ]);

    return reply.send({
      data: incidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // GET /api/incidents/:id - Get single incident
  fastify.get('/api/incidents/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { createdAt: 'asc' } },
        messages: { orderBy: { createdAt: 'asc' } },
        metrics: { orderBy: { recordedAt: 'desc' }, take: 100 },
      },
    });

    if (!incident) {
      return reply.code(404).send({ error: 'Incident not found' });
    }

    return reply.send(incident);
  });

  // POST /api/incidents - Create incident (from simulation)
  fastify.post('/api/incidents', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { source?: string };
    const incident = generateMockIncident();

    const created = await prisma.incident.create({
      data: {
        id: incident.id,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        source: (body.source || incident.source) as any,
        metadata: incident.metadata as any,
      },
    });

    return reply.code(201).send(created);
  });

  // PATCH /api/incidents/:id - Update incident status
  fastify.patch('/api/incidents/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { status: string };

    const incident = await prisma.incident.update({
      where: { id },
      data: { status: body.status },
    });

    return reply.send(incident);
  });

  // DELETE /api/incidents/:id - Delete incident
  fastify.delete('/api/incidents/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    await prisma.incident.delete({ where: { id } });
    return reply.code(204).send();
  });
}
