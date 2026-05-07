'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MessageList } from '@/components/ui/MessageList';
import { formatTimeAgo } from '@/lib/utils';

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  createdAt: string;
  updatedAt: string;
}

interface AgentTask {
  id: string;
  agentName: string;
  taskType: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function IncidentDetail() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (incidentId) {
      loadIncidentDetail();
    }
  }, [incidentId]);

  async function loadIncidentDetail() {
    try {
      const [incidentData, tasksData] = await Promise.all([
        api.incidents.getById(incidentId),
        api.tasks.listByIncident(incidentId),
      ]);
      setIncident(incidentData);
      setTasks(tasksData.items);
    } catch (error) {
      console.error('Failed to load incident detail:', error);
    } finally {
      setLoading(false);
    }
  }

  const severityColors: Record<string, string> = {
    critical: 'destructive',
    high: 'warning',
    medium: 'info',
    low: 'default',
  };

  const statusColors: Record<string, string> = {
    active: 'warning',
    investigating: 'info',
    resolved: 'success',
    closed: 'default',
  };

  const taskTypeColors: Record<string, string> = {
    triage: 'info',
    rca: 'purple',
    mitigation: 'warning',
    communication: 'default',
    sre: 'success',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading incident details...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-medium">Incident not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{incident.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[incident.status] || 'default'}>
              {incident.status}
            </Badge>
            <Badge variant={severityColors[incident.severity] || 'default'}>
              {incident.severity}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Created {formatTimeAgo(incident.createdAt)}</p>
          <p>Updated {formatTimeAgo(incident.updatedAt)}</p>
        </div>
      </div>

      {/* Description */}
      {incident.description && (
        <Card title="Description">
          <p className="text-sm text-muted-foreground">{incident.description}</p>
        </Card>
      )}

      {/* Agent Tasks */}
      <Card title="Agent Tasks" description={`${tasks.length} tasks assigned`}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{task.agentName}</span>
                  <Badge variant={taskTypeColors[task.taskType] || 'default'}>
                    {task.taskType}
                  </Badge>
                  <Badge variant={task.status === 'completed' ? 'success' : 'info'}>
                    {task.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Updated {formatTimeAgo(task.updatedAt)}
                </p>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No agent tasks assigned yet</p>
            </div>
          )}
        </div>
      </Card>

      {/* Agent Messages */}
      <Card title="Agent Communication" description="Real-time messages from AI agents">
        <MessageList incidentId={incidentId} />
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-6">
        <p>Incident {incidentId} - Multi-Agent Orchestration Demo</p>
      </div>
    </div>
  );
}
