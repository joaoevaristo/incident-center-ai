import { v4 as uuidv4 } from 'uuid';

const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
const SOURCES = ['simulated', 'monitoring', 'user_report'] as const;
const AGENT_NAMES = ['triage', 'rca', 'mitigation', 'communication', 'sre'] as const;
const CHANNELS = ['slack', 'email', 'webhook'] as const;

const INCIDENT_TITLES = [
  'Production API latency spike detected in payment service',
  'Database connection pool exhaustion on primary cluster',
  'Memory leak causing OOM kills in user-auth service',
  'SSL certificate expiry imminent for api.sensedia.com',
  'Kubernetes pod crash loop in staging environment',
  'Rate limiter misconfiguration causing 429 storms',
  'Cache invalidation failure leading to stale data',
  'Message queue backlog exceeding threshold',
  'Disk space critical on log aggregation nodes',
  'Service mesh sidecar injection failure',
  'DNS resolution timeout for external dependencies',
  'WebSocket connection drops during peak traffic',
  'GraphQL query complexity causing timeout',
  'Container image scan revealed CVE vulnerability',
  'Load balancer health check failures',
];

const INCIDENT_DESCRIPTIONS = [
  'Users reporting slow response times and intermittent 503 errors on production endpoints. Monitoring dashboards show latency p99 exceeding 5s threshold.',
  'Primary database cluster reaching maximum connection limit. Application connections queuing with timeout errors. Failover tested but not triggered.',
  'Memory usage in user-auth service increasing steadily over 48h. Container restarts occurring every 2-3h. Heap dump analysis pending.',
  'SSL certificate for api.sensedia.com expires in 7 days. Auto-renewal failed due to DNS configuration issue. Manual intervention required.',
  'Multiple pods in staging namespace entering CrashLoopBackOff state. Recent deployment includes changes to environment variable configuration.',
  'Rate limiter incorrectly configured for new API version. Clients receiving 429 errors for legitimate requests. Rollback plan prepared.',
  'Cache layer not invalidating on data updates. Users seeing stale content up to 24h old. Cache TTL misconfiguration suspected.',
  'Message queue consumer lag increasing. Dead letter queue accumulating messages. Consumer scaling attempted but resource limits hit.',
  'Log aggregation nodes at 95% disk usage. Log rotation not functioning. Risk of data loss if disks fill completely.',
  'New service mesh deployment failing to inject sidecar containers. Pods starting without mTLS. Security team notified.',
];

const AGENT_RESPONSES = {
  triage: [
    'Incident classified as {severity}. Initial impact assessment: {impact}. Recommended response time: {responseTime}. Escalation path: on-call SRE → team lead.',
    'Severity confirmed as {severity} based on user impact and SLA breach. Affected services: {services}. First response within {responseTime}.',
    'Triage analysis complete. Incident {severity} — {impact}. Root cause category: infrastructure. Recommended team: {team}.',
  ],
  rca: [
    'Root cause analysis: {cause}. Contributing factors: {factors}. Evidence: {evidence}. Confidence: {confidence}%.',
    'Post-incident analysis identifies {cause} as primary root cause. Timeline shows trigger at {time}. Mitigation steps: {steps}.',
    'Deep dive reveals {cause}. Correlation with recent deployment #{deploy} confirmed. A/B testing data supports {confidence}% confidence.',
  ],
  mitigation: [
    'Recommended mitigation: {action}. Expected impact: {impact}. Rollback plan: {rollback}. ETA: {eta}.',
    'Mitigation strategy: {action}. This should reduce impact by {impact}% within {eta}. Verification: monitoring dashboard.',
    'Proposed fix: {action}. Testing in staging passed. Deployment window: {window}. Rollback procedure documented.',
  ],
  communication: [
    'Stakeholder notification sent: Incident {incidentId} — {severity} — {summary}. Channels: {channels}.',
    'Customer communication drafted: {message}. Review required before sending via {channel}.',
    'Status update distributed to {audience}. Next update scheduled in {interval}. War room: {room}.',
  ],
  sre: [
    'SRE analysis: {analysis}. Capacity planning recommendation: {recommendation}. SLA impact: {slaImpact}.',
    'Infrastructure assessment: {assessment}. Scaling recommendation: {scaling}. Cost impact: {costImpact}.',
    'SRE review complete. System resilience score: {score}/10. Improvement areas: {areas}.',
  ],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || `{${key}}`);
}

export function generateMockIncident() {
  const severity = randomFrom(SEVERITIES);
  const responseTimes: Record<string, string> = {
    critical: '5 minutes',
    high: '15 minutes',
    medium: '1 hour',
    low: '4 hours',
  };
  const impacts: Record<string, string> = {
    critical: 'Complete service outage affecting all users',
    high: 'Major feature degradation affecting 30%+ of users',
    medium: 'Partial degradation affecting specific user segments',
    low: 'Minor issue with limited user impact',
  };
  const teams = ['platform', 'payments', 'auth', 'infra', 'backend'];

  return {
    id: uuidv4(),
    title: randomFrom(INCIDENT_TITLES),
    description: randomFrom(INCIDENT_DESCRIPTIONS),
    severity,
    status: 'detected' as const,
    source: randomFrom(SOURCES),
    metadata: {
      responseTime: responseTimes[severity],
      impact: impacts[severity],
      team: randomFrom(teams),
    },
  };
}

export function generateAgentResponse(agentName: string, severity?: string): string {
  const responses = AGENT_RESPONSES[agentName as keyof typeof AGENT_RESPONSES];
  if (!responses) return 'No response template for this agent.';

  const sev = severity || 'medium';
  const templates = {
    triage: {
      severity: sev,
      impact: `Affecting ${Math.floor(Math.random() * 10000) + 100} users`,
      responseTime: sev === 'critical' ? '5 min' : sev === 'high' ? '15 min' : '1h',
      services: 'payment-api, user-service',
      team: 'platform team',
    },
    rca: {
      cause: 'memory leak in connection pool handler',
      factors: 'no connection timeout, missing metrics',
      evidence: 'heap dump shows 2.3GB unused allocations',
      confidence: '87',
      time: `${Math.floor(Math.random() * 24)}h ago`,
      steps: 'restart pool, add timeout, deploy fix',
      deploy: `${Math.floor(Math.random() * 500) + 100}`,
    },
    mitigation: {
      action: 'scale up instances and restart affected pods',
      impact: '70',
      rollback: 'revert to previous deployment',
      eta: '15 minutes',
      window: 'next 30 minutes',
    },
    communication: {
      incidentId: uuidv4().substring(0, 8),
      summary: 'Service degradation under investigation',
      channels: 'Slack, email, status page',
      audience: 'engineering and product leads',
      interval: '30 minutes',
      room: 'war-room-incident',
    },
    sre: {
      analysis: 'System has single points of failure in database layer',
      recommendation: 'Implement read replicas and connection pooling',
      slaImpact: 'SLA breached by 2.3%',
      assessment: 'Current capacity at 85% utilization',
      scaling: 'Add 3 replicas to each service',
      costImpact: '+$2,400/month',
      score: String(Math.floor(Math.random() * 5) + 4),
      areas: 'circuit breakers, retry policies, graceful degradation',
    },
  };

  const vars = templates[agentName as keyof typeof templates] || {};
  const template = randomFrom(responses);
  return fillTemplate(template, vars as Record<string, string>);
}

export function generateMockTask(agentName: string, severity?: string) {
  return {
    id: uuidv4(),
    agentName: agentName as any,
    status: 'completed' as const,
    inputData: { incidentId: uuidv4(), severity: severity || 'medium' },
    outputData: { response: generateAgentResponse(agentName, severity) },
    startedAt: new Date().toISOString(),
    completedAt: new Date(Date.now() + Math.random() * 30000).toISOString(),
  };
}

export function generateMockMessage(agentName: string, severity?: string) {
  return {
    id: uuidv4(),
    agentName: agentName as any,
    channel: randomFrom(CHANNELS) as any,
    content: generateAgentResponse(agentName, severity),
    sentAt: new Date().toISOString(),
  };
}

export function generateMockMetric(incidentId: string) {
  const metrics = [
    { name: 'response_time_ms', type: 'gauge' as const, min: 100, max: 5000 },
    { name: 'error_rate', type: 'gauge' as const, min: 0, max: 1 },
    { name: 'cpu_usage', type: 'gauge' as const, min: 10, max: 100 },
    { name: 'memory_usage_mb', type: 'gauge' as const, min: 100, max: 4096 },
    { name: 'request_count', type: 'counter' as const, min: 1000, max: 50000 },
    { name: 'active_connections', type: 'gauge' as const, min: 10, max: 500 },
  ];
  const metric = randomFrom(metrics);
  return {
    id: uuidv4(),
    incidentId,
    metricName: metric.name,
    metricValue: Math.random() * (metric.max - metric.min) + metric.min,
    metricType: metric.type,
    labels: { service: 'simulated', environment: 'demo' },
    recordedAt: new Date().toISOString(),
  };
}
