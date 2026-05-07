import prisma from '../utils/db';
import { generateMockIncident, generateAgentResponse } from '../utils/mock-data';
import { createTask, updateTaskStatus } from './task-service';
import { createMessage } from './message-service';
import { simulateMetrics } from './metric-service';

async function executeAgentTask(incidentId: string, agentName: string) {
  const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
  if (!incident) throw new Error('Incident not found');

  const task = await createTask(incidentId, { agentName });

  await updateTaskStatus(task.id, { status: 'running' });

  const delay = 1000 + Math.random() * 3000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const response = generateAgentResponse(agentName, incident.severity);

  await updateTaskStatus(task.id, {
    status: 'completed',
    outputData: { response },
  });

  await createMessage(incidentId, {
    agentName,
    channel: 'slack',
    content: response,
  });

  await simulateMetrics(incidentId, 2);

  return task;
}

export async function startSimulator() {
  await prisma.setting.upsert({
    where: { key: 'simulator.enabled' },
    update: { value: true },
    create: { key: 'simulator.enabled', value: true },
  });
  return { status: 'simulator started' };
}

export async function stopSimulator() {
  await prisma.setting.upsert({
    where: { key: 'simulator.enabled' },
    update: { value: false },
    create: { key: 'simulator.enabled', value: false },
  });
  return { status: 'simulator stopped' };
}

export { executeAgentTask };
