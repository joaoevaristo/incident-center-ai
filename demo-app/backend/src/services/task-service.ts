import prisma from '../utils/db';

export async function listTasks(incidentId: string) {
  return prisma.agentTask.findMany({
    where: { incidentId },
    orderBy: { startedAt: 'desc' },
  });
}

export async function getTask(incidentId: string, taskId: string) {
  return prisma.agentTask.findUnique({
    where: { id: taskId, incidentId },
  });
}

export async function createTask(incidentId: string, data: { agentName: string; inputData?: any }) {
  return prisma.agentTask.create({
    data: {
      incidentId,
      agentName: data.agentName as any,
      inputData: data.inputData,
      status: 'running',
      startedAt: new Date(),
    },
  });
}

export async function updateTaskStatus(taskId: string, data: { status: string; outputData?: any; errorMessage?: string }) {
  const updateData: any = {
    status: data.status as any,
    outputData: data.outputData,
    errorMessage: data.errorMessage,
  };
  if (data.status === 'completed' || data.status === 'failed') {
    updateData.completedAt = new Date();
  }
  return prisma.agentTask.update({
    where: { id: taskId },
    data: updateData,
  });
}
