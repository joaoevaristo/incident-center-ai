import prisma from '../utils/db';
import { generateMockMetric } from '../utils/mock-data';

export async function listMetrics(incidentId: string) {
  return prisma.metricSnapshot.findMany({
    where: { incidentId },
    orderBy: { recordedAt: 'desc' },
    take: 100,
  });
}

export async function createMetric(incidentId: string, data: { metricName: string; metricValue: number; metricType?: string; labels?: any }) {
  return prisma.metricSnapshot.create({
    data: {
      incidentId,
      metricName: data.metricName,
      metricValue: data.metricValue,
      metricType: (data.metricType || 'gauge') as any,
      labels: data.labels || {},
    },
  });
}

export async function simulateMetrics(incidentId: string, count: number = 5) {
  const metrics = [];
  for (let i = 0; i < count; i++) {
    const mock = generateMockMetric(incidentId);
    metrics.push(
      prisma.metricSnapshot.create({
        data: {
          incidentId,
          metricName: mock.metricName,
          metricValue: mock.metricValue,
          metricType: mock.metricType,
          labels: mock.labels,
        },
      })
    );
  }
  return Promise.all(metrics);
}
