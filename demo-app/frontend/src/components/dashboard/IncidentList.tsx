import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatTimeAgo } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Incident {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: string;
  updatedAt: string;
}

export default function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      const data = await api.incidents.list();
      setIncidents(data.items);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredIncidents = incidents.filter((incident) =>
    incident.title.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Incidents</h2>
        <div className="w-64">
          <Input
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Severity</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push(`/incidents/${incident.id}`)}
                >
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
                  <td className="p-4 align-middle">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/incidents/${incident.id}`);
                      }}
                      className="text-primary hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredIncidents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No incidents found</p>
              {search && <p className="text-sm mt-1">Try a different search term</p>}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
