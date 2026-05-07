import prisma from '../utils/db';
import { generateMockIncident } from '../utils/mock-data';

export async function createIncident(data: { title: string; description?: string; severity?: string }) {
  const severity = (data.severity || 'medium') as any;
  const incident = await prisma.incident.create({
    data: {
      title: data.title,
      description: data.description,
      severity,
      source: 'user_report',
    },
  });
  return incident;
}

export async function listIncidents() {
  return prisma.incident.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { tasks: true, messages: true } },
    },
  });
}

export async function getIncident(id: string) {
  return prisma.incident.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { startedAt: 'desc' } },
      messages: { orderBy: { sentAt: 'desc' } },
      metrics: { orderBy: { recordedAt: 'desc' }, take: 50 },
    },
  });
}

export async function updateIncident(id: string, data: { status?: string; severity?: string }) {
  const updateData: any = {};
  if (data.status) {
    updateData.status = data.status;
    if (data.status === 'resolved') updateData.resolvedAt = new Date();
    if (data.status === 'closed') updateData.closedAt = new Date();
  }
  if (data.severity) updateData.severity = data.severity;

  return prisma.incident.update({
    where: { id },
    data: updateData,
    include: {
      tasks: { orderBy: { startedAt: 'desc' } },
      messages: { orderBy: { sentAt: 'desc' } },
      metrics: { orderBy: { recordedAt: 'desc' }, take: 50 },
    },
  });
}

export async function deleteIncident(id: string) {
  return prisma.incident.delete({ where: { id } });
}

export async function simulateIncident() {
  const mock = generateMockIncident();
  return prisma.incident.create({
    data: {
      title: mock.title,
      description: mock.description,
      severity: mock.severity,
      source: mock.source,
    },
  });
}

export async function getIncidentCountByStatus() {
  return prisma.incident.groupBy({
    by: ['status'],
    _count: true,
  });
}

export async function getIncidentCountBySeverity() {
  return prisma.incident.groupBy({
    by: ['severity'],
    _count: true,
  });
}
