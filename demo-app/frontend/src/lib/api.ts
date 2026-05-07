const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  incidents: {
    list: (params?: { status?: string; severity?: string; page?: number; limit?: number }) =>
      request<{ items: any[]; total: number; page: number; limit: number }>(
        `/api/incidents${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
      ),
    get: (id: string) => request<any>(`/api/incidents/${id}`),
    create: (data: any) => request<any>('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request<any>(`/api/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  },
  tasks: {
    list: (incidentId: string) => request<any[]>(`/api/tasks?incidentId=${incidentId}`),
    create: (data: any) => request<any>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  messages: {
    list: (incidentId: string) => request<any[]>(`/api/messages?incidentId=${incidentId}`),
    create: (data: any) => request<any>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  metrics: {
    list: (params?: { incidentId?: string; metricType?: string; limit?: number }) =>
      request<any[]>(
        `/api/metrics${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
      ),
    create: (data: any) => request<any>('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    trend: (metricType: string, incidentId?: string) =>
      request<any[]>(
        `/api/metrics/trend?metricType=${metricType}${incidentId ? `&incidentId=${incidentId}` : ''}`
      ),
  },
  settings: {
    list: () => request<any[]>('/api/settings'),
    get: (key: string) => request<any>(`/api/settings/${key}`),
    update: (key: string, value: string) => request<any>('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    }),
  },
  simulator: {
    start: () => request<any>('/api/simulator/start', { method: 'POST' }),
    stop: () => request<any>('/api/simulator/stop', { method: 'POST' }),
    status: () => request<any>('/api/simulator/status'),
    incident: (source?: string) =>
      request<any>('/api/simulator/incident', {
        method: 'POST',
        body: JSON.stringify({ source }),
      }),
  },
};
