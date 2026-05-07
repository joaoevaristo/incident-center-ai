import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatTimeAgo } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Incident {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: string;
  updatedAt: string;
}

export default function IncidentDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [simulating, setSimulating] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0, avgMtti: 0 });

  useEffect(() => {
    loadIncidents();
    loadMetrics();
  }, [filterStatus, filterSeverity]);

  async function loadIncidents() {
    try {
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterSeverity !== 'all') params.severity = filterSeverity;
      const data = await api.incidents.list(params);
      setIncidents(data.items);
      setStats({
        total: data.total,
        active: data.items.filter((i: Incident) => i.status === 'active').length,
        resolved: data.items.filter((i: Incident) => i.status === 'resolved').length,
        avgMtti: 12.5,
      });
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMetrics() {
    try {
      const data = await api.metrics.trend('response_time');
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }

  async function handleStartSimulation() {
    try {
      await api.simulator.start();
      setSimulating(true);
      // Auto-generate incidents
      for (let i = 0; i < 3; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        await api.simulator.incident('simulator');
      }
      await loadIncidents();
    } catch (error) {
      console.error('Failed to start simulation:', error);
    }
  }

  async function handleStopSimulation() {
    try {
      await api.simulator.stop();
      setSimulating(false);
    } catch (error) {
      console.error('Failed to stop simulation:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Incident Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incident Center AI</h1>
          <p className="text-muted-foreground">Multi-agent orchestration dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={simulating ? 'success' : 'outline'}>
            {simulating ? '● Simulating' : '○ Idle'}
          </Badge>
          <Button
            variant={simulating ? 'destructive' : 'default'}
            onClick={simulating ? handleStopSimulation : handleStartSimulation}
          >
            {simulating ? 'Stop Simulation' : 'Start Simulation'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="flex flex-col space-y-1.5 p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Incidents</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col space-y-1.5 p-6">
            <p className="text-sm font-medium text-muted-foreground">Active</p>
            <p className="text-3xl font-bold text-yellow-500">{stats.active}</p>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col space-y-1.5 p-6">
            <p className="text-sm font-medium text-muted-foreground">Resolved</p>
            <p className="text-3xl font-bold text-green-500">{stats.resolved}</p>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col space-y-1.5 p-6">
            <p className="text-sm font-medium text-muted-foreground">Avg MTTI (min)</p>
            <p className="text-3xl font-bold">{stats.avgMtti}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4 p-6">
          <Select
            label="Status"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'investigating', label: 'Investigating' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
          <Select
            label="Severity"
            value={filterSeverity}
            onChange={setFilterSeverity}
            options={[
              { value: 'all', label: 'All Severities' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
        </div>
      </Card>

      {/* Metrics Chart */}
      <Card title="Response Time Trend" description="Average response time over last 24 hours">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f620" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Incidents Table */}
      <Card title="Incidents" description={`${incidents.length} incidents found`}>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Severity</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Updated</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {incidents.map((incident) => (
                <tr key={incident.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle font-medium">{incident.title}</td>
                  <td className="p-4 align-middle">
                    <Badge variant={statusColors[incident.status] || 'default'}>
                      {incident.status}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant={severityColors[incident.severity] || 'default'}>
                      {incident.severity}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">{formatTimeAgo(incident.createdAt)}</td>
                  <td className="p-4 align-middle text-muted-foreground">{formatTimeAgo(incident.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {incidents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No incidents found</p>
              <p className="text-sm mt-1">Start a simulation to generate incidents</p>
            </div>
          )}
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-6">
        <p>Incident Center AI v1.0.0 - Multi-Agent Orchestration Demo</p>
      </div>
    </div>
  );
}
