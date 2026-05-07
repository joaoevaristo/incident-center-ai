# Technical Specification - Incident Center AI

| Field | Value |
|---|---|
| **Module** | Incident Center AI |
| **Author** | João Evaristo / Qwen AI Squad |
| **Date** | 2026-05-06 |
| **Related PRD** | docs/squad/prd/incident-center-ai.md |
| **Architecture Ref** | docs/squad/architecture/incident-center-ai.md |
| **Tier** | T2 |

## 1. Overview

Build a visual SaaS demo for multi-agent orchestration and AI Ops. The system simulates incident detection, triage, RCA, mitigation, and communication through 5 specialized agents. All data is mocked/simulated for demonstration purposes.

## 2. Scope

### In Scope
- Demo App with mock data generator and simulated agent behaviors
- Incident Center API with agent orchestration engine
- Incident Center UI with 5 main screens (Dashboard, Incident Detail, Agent Console, Metrics, Settings)
- Docker Compose setup with PostgreSQL, Redis, Prometheus, Grafana, Loki
- OpenTelemetry instrumentation with Prometheus metrics export
- BullMQ job queue for agent task processing
- Dark mode UI with responsive design

### Out of Scope
- Real incident detection from production systems
- Real agent integrations (Slack, PagerDuty, etc.)
- Production-grade security and auth
- Multi-tenancy
- Historical data retention beyond demo session

## 3. Design

### 3.1 Data Model

```sql
-- Incidents
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- critical, high, medium, low
    status VARCHAR(20) NOT NULL DEFAULT 'detected', -- detected, triaging, investigating, mitigating, resolved, closed
    source VARCHAR(50) NOT NULL DEFAULT 'simulated', -- simulated, monitoring, user_report
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP
);

-- Agent Tasks (BullMQ job mapping)
CREATE TABLE agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    agent_name VARCHAR(50) NOT NULL, -- triage, rca, mitigation, communication, sre
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    input_data JSONB,
    output_data JSONB,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);

-- Agent Messages (Communication log)
CREATE TABLE agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    agent_name VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'slack', -- slack, email, webhook
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- Metrics snapshots (for Prometheus/Grafana)
CREATE TABLE metrics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_type VARCHAR(20) NOT NULL DEFAULT 'gauge', -- gauge, counter, histogram
    labels JSONB DEFAULT '{}',
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Settings (configurable demo parameters)
CREATE TABLE settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
    ('simulator.enabled', 'true'),
    ('simulator.interval_seconds', '30'),
    ('simulator.incident_count', '5'),
    ('agents.auto_execute', 'true'),
    ('agents.execution_delay_ms', '2000'),
    ('ui.theme', '"dark"'),
    ('ui.refresh_interval_seconds', '10');
```

### 3.2 API Endpoints

| Endpoint | Method | Request Body | Response |
|---|---|---|---|
| `/api/incidents` | GET | - | `{ incidents: Incident[] }` |
| `/api/incidents` | POST | `{ title, description, severity }` | `{ incident: Incident }` |
| `/api/incidents/:id` | GET | - | `{ incident: Incident }` |
| `/api/incidents/:id` | PATCH | `{ status, severity }` | `{ incident: Incident }` |
| `/api/incidents/:id` | DELETE | - | `{ success: boolean }` |
| `/api/incidents/:id/tasks` | GET | - | `{ tasks: AgentTask[] }` |
| `/api/incidents/:id/tasks` | POST | `{ agent_name }` | `{ task: AgentTask }` |
| `/api/incidents/:id/tasks/:taskId` | GET | - | `{ task: AgentTask }` |
| `/api/incidents/:id/messages` | GET | - | `{ messages: AgentMessage[] }` |
| `/api/incidents/:id/messages` | POST | `{ agent_name, channel, content }` | `{ message: AgentMessage }` |
| `/api/incidents/:id/metrics` | GET | - | `{ snapshots: MetricSnapshot[] }` |
| `/api/incidents/:id/metrics` | POST | `{ metric_name, metric_value, metric_type, labels }` | `{ snapshot: MetricSnapshot }` |
| `/api/simulator/generate` | POST | - | `{ incident: Incident }` |
| `/api/simulator/start` | POST | - | `{ status: string }` |
| `/api/simulator/stop` | POST | - | `{ status: string }` |
| `/api/agents/status` | GET | - | `{ agents: AgentStatus[] }` |
| `/api/agents/:name/execute` | POST | `{ incident_id }` | `{ task: AgentTask }` |
| `/api/metrics/prometheus` | GET | - | Prometheus format metrics |
| `/api/settings` | GET | - | `{ settings: Record<string, any> }` |
| `/api/settings` | PATCH | `{ key, value }` | `{ setting: Setting }` |

### 3.3 Component Structure

```
incident-center-ai/
├── qwen-ai-squad/                    # Qwen skill (copied from vault)
├── demo-app/                         # Demo application
│   ├── backend/                      # Fastify/Node.js backend
│   │   ├── src/
│   │   │   ├── agents/               # Agent implementations
│   │   │   │   ├── triage-agent.ts
│   │   │   │   ├── rca-agent.ts
│   │   │   │   ├── mitigation-agent.ts
│   │   │   │   ├── communication-agent.ts
│   │   │   │   └── sre-agent.ts
│   │   │   ├── services/             # Business logic
│   │   │   │   ├── incident-service.ts
│   │   │   │   ├── task-service.ts
│   │   │   │   ├── message-service.ts
│   │   │   │   ├── metric-service.ts
│   │   │   │   ├── simulator-service.ts
│   │   │   │   └── settings-service.ts
│   │   │   ├── models/               # Database models
│   │   │   │   ├── incident.model.ts
│   │   │   │   ├── agent-task.model.ts
│   │   │   │   ├── agent-message.model.ts
│   │   │   │   ├── metric-snapshot.model.ts
│   │   │   │   └── settings.model.ts
│   │   │   ├── routes/               # API routes
│   │   │   │   ├── incidents.routes.ts
│   │   │   │   ├── tasks.routes.ts
│   │   │   │   ├── messages.routes.ts
│   │   │   │   ├── metrics.routes.ts
│   │   │   │   ├── simulator.routes.ts
│   │   │   │   ├── agents.routes.ts
│   │   │   │   └── settings.routes.ts
│   │   │   ├── middleware/             # Request middleware
│   │   │   │   ├── error-handler.middleware.ts
│   │   │   │   └── logger.middleware.ts
│   │   │   ├── utils/                # Utilities
│   │   │   │   ├── db.ts               # Database connection
│   │   │   │   ├── queue.ts            # BullMQ queue setup
│   │   │   │   ├── otel.ts             # OpenTelemetry setup
│   │   │   │   └── mock-data.ts        # Mock data generators
│   │   │   └── index.ts              # Entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/                     # Next.js frontend
│       ├── src/
│       │   ├── app/                    # Next.js App Router
│       │   │   ├── layout.tsx          # Root layout with dark mode
│       │   │   ├── page.tsx            # Dashboard (home)
│       │   │   ├── incidents/
│       │   │   │   ├── page.tsx        # Incidents list
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx    # Incident detail
│       │   │   ├── agents/
│       │   │   │   └── page.tsx        # Agent console
│       │   │   ├── metrics/
│       │   │   │   └── page.tsx        # Metrics dashboard
│       │   │   └── settings/
│       │   │       └── page.tsx        # Settings page
│       │   ├── components/             # Reusable components
│       │   │   ├── layout/
│       │   │   │   ├── Header.tsx
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   └── MainLayout.tsx
│       │   │   ├── incidents/
│       │   │   │   ├── IncidentCard.tsx
│       │   │   │   ├── IncidentList.tsx
│       │   │   │   ├── IncidentForm.tsx
│       │   │   │   └── IncidentDetail.tsx
│       │   │   ├── agents/
│       │   │   │   ├── AgentCard.tsx
│       │   │   │   ├── AgentConsole.tsx
│       │   │   │   └── AgentTaskList.tsx
│       │   │   ├── metrics/
│       │   │   │   ├── MetricsChart.tsx
│       │   │   │   ├── MetricsTable.tsx
│       │   │   │   └── MetricsSummary.tsx
│       │   │   └── common/
│       │   │       ├── Badge.tsx
│       │   │       ├── Button.tsx
│       │   │       ├── Card.tsx
│       │   │       ├── Modal.tsx
│       │   │       └── Spinner.tsx
│       │   ├── lib/                    # Client-side utilities
│       │   │   ├── api.ts              # API client
│       │   │   └── store.ts            # State management (Zustand)
│       │   └── styles/
│       │       └── globals.css         # Tailwind + custom styles
│       ├── public/                     # Static assets
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── tsconfig.json
│       └── package.json
├── observability/                      # Observability configs
│   ├── prometheus.yml
│   ├── grafana/
│   │   ├── datasource.yml
│   │   └── dashboards/
│   │       └── incident-center.json
│   └── loki/
│       └── loki-config.yml
├── docs/                               # Documentation
│   └── squad/
│       ├── prd/
│       │   └── incident-center-ai.md
│       ├── tech-spec/
│       │   └── incident-center-ai.md
│       └── metrics/
│           └── timeline.log
├── docker-compose.yml                  # Docker Compose for all services
├── QWEN.md                             # Project context
└── README.md                           # Project README
```

## 4. Implementation Plan

| Step | Task | Owner | Status |
|---|---|---|---|
| 1 | Set up project structure and configs | Backend | Pending |
| 2 | Implement database models and migrations | Backend | Pending |
| 3 | Implement agent services (Triage, RCA, Mitigation, Communication, SRE) | Backend | Pending |
| 4 | Implement BullMQ job queue integration | Backend | Pending |
| 5 | Implement API routes (incidents, tasks, messages, metrics, simulator, agents, settings) | Backend | Pending |
| 6 | Implement OpenTelemetry instrumentation | Backend | Pending |
| 7 | Implement mock data generators | Backend | Pending |
| 8 | Set up Next.js frontend with Tailwind CSS | Frontend | Pending |
| 9 | Build MainLayout, Header, Sidebar components | Frontend | Pending |
| 10 | Build Dashboard (home) page | Frontend | Pending |
| 11 | Build Incidents list and detail pages | Frontend | Pending |
| 12 | Build Agent Console page | Frontend | Pending |
| 13 | Build Metrics Dashboard page | Frontend | Pending |
| 14 | Build Settings page | Frontend | Pending |
| 15 | Configure Prometheus, Grafana, Loki | DevOps | Pending |
| 16 | Create docker-compose.yml with all services | DevOps | Pending |
| 17 | End-to-end testing | QA | Pending |
| 18 | Performance testing | QA | Pending |
| 19 | Documentation | Docs | Pending |

## 5. Testing Strategy

| Type | Tool | Coverage Target |
|---|---|---|
| Unit | Vitest | 80%+ |
| Integration | Supertest | Key API flows |
| E2E | Playwright | Critical user paths |

## 6. Migration Plan

- Use Prisma ORM for database migrations
- Initial migration creates all tables from schema.sql
- Feature flag for simulator: `simulator.enabled` in settings table
- Rollout: Start with all features disabled, enable simulator, then enable auto-execution

## 7. Rollback Plan

- Docker Compose makes rollback trivial: `docker compose down && docker compose up -d`
- Database migrations are forward-only; to rollback, restore from backup or recreate container
- Frontend changes are static assets; rollback via `docker compose up -d`

## 8. Open Questions

- Should we use Prisma or raw SQL queries? → **Decision**: Prisma for type safety and developer experience
- Should we use Zustand or Redux for state management? → **Decision**: Zustand for simplicity
- Should we use real WebSocket for live updates? → **Decision**: Polling with configurable interval for MVP (can be upgraded to WebSocket later)
