import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../utils/db';

export async function settingsRoutes(fastify: FastifyInstance) {
  // GET /api/settings - Get all settings
  fastify.get('/api/settings', async (_request: FastifyRequest, reply: FastifyReply) => {
    const settings = await prisma.setting.findMany();
    return reply.send(settings);
  });

  // GET /api/settings/:key - Get single setting
  fastify.get('/api/settings/:key', async (request: FastifyRequest, reply: FastifyReply) => {
    const { key } = request.params as { key: string };

    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      return reply.code(404).send({ error: 'Setting not found' });
    }
    return reply.send(setting);
  });

  // POST /api/settings - Create or update setting
  fastify.post('/api/settings', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { key: string; value: string };

    const setting = await prisma.setting.upsert({
      where: { key: body.key },
      update: { value: body.value },
      create: { key: body.key, value: body.value },
    });

    return reply.code(201).send(setting);
  });
}
