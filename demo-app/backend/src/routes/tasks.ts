import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../utils/db';

export async function tasksRoutes(fastify: FastifyInstance) {
  // GET /api/incidents/:incidentId/tasks - List tasks for an incident
  fastify.get('/api/incidents/:incidentId/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
    const { incidentId } = request.params as { incidentId: string };

    const tasks = await prisma.agentTask.findMany({
      where: { incidentId },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send(tasks);
  });

  // POST /api/incidents/:incidentId/tasks - Create a task
  fastify.post('/api/incidents/:incidentId/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
    const { incidentId } = request.params as { incidentId: string };
    const body = request.body as {
      agentName: string;
      inputData?: Record<string, unknown>;
    };

    const task = await prisma.agentTask.create({
      data: {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        incidentId,
        agentName: body.agentName as any,
        inputData: (body.inputData || {}) as any,
        status: 'pending',
      },
    });

    return reply.code(201).send(task);
  });

  // PATCH /api/tasks/:id - Update task status
  fastify.patch('/api/tasks/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      status?: string;
      outputData?: Record<string, unknown>;
    };

    const task = await prisma.agentTask.update({
      where: { id },
      data: {
        status: (body.status || 'completed') as any,
        outputData: (body.outputData || {}) as any,
        completedAt: body.status === 'completed' ? new Date().toISOString() : undefined,
      },
    });

    return reply.send(task);
  });
}
