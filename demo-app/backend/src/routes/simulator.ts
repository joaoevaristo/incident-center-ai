import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../utils/db';
import { simulatorService } from '../services/simulator-service';

export async function simulatorRoutes(fastify: FastifyInstance) {
  // POST /api/simulator/start - Start simulation
  fastify.post('/api/simulator/start', async (_request: FastifyRequest, reply: FastifyReply) => {
    const simulation = await simulatorService.startSimulation();
    return reply.code(201).send(simulation);
  });

  // POST /api/simulator/stop - Stop simulation
  fastify.post('/api/simulator/stop', async (_request: FastifyRequest, reply: FastifyReply) => {
    await simulatorService.stopSimulation();
    return reply.send({ status: 'simulation stopped' });
  });

  // GET /api/simulator/status - Get simulation status
  fastify.get('/api/simulator/status', async (_request: FastifyRequest, reply: FastifyReply) => {
    const status = await simulatorService.getSimulationStatus();
    return reply.send(status);
  });

  // POST /api/simulator/incident - Create single incident
  fastify.post('/api/simulator/incident', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { source?: string };
    const incident = await simulatorService.createIncident(body.source);
    return reply.code(201).send(incident);
  });
}
