import prisma from '../utils/db';

export async function listMessages(incidentId: string) {
  return prisma.agentMessage.findMany({
    where: { incidentId },
    orderBy: { sentAt: 'desc' },
  });
}

export async function createMessage(incidentId: string, data: { agentName: string; channel: string; content: string }) {
  return prisma.agentMessage.create({
    data: {
      incidentId,
      agentName: data.agentName as any,
      channel: data.channel as any,
      content: data.content,
    },
  });
}
