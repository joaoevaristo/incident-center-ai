import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../utils/db';

export async function messagesRoutes(fastify: FastifyInstance) {
  // GET /api/incidents/:incidentId/messages - List messages for an incident
  fastify.get('/api/incidents/:incidentId/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    const { incidentId } = request.params as { incidentId: string };

    const messages = await prisma.agentMessage.findMany({
      where: { incidentId },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send(messages);
  });

  // POST /api/incidents/:incidentId/messages - Create a message
  fastify.post('/api/incidents/:incidentId/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    const { incidentId } = request.params as { incidentId: string };
    const body = request.body as {
      agentName: string;
      channel: string;
      content: string;
    };

    const message = await prisma.agentMessage.create({
      data: {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        incidentId,
        agentName: body.agentName as any,
        channel: body.channel as any,
        content: body.content,
      },
    });

    return reply.code(201).send(message);
  });
}
