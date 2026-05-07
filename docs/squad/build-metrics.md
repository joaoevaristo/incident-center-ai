# Incident Center AI - Métricas de Build

## Método de Construção

**Arquitetura**: Monorepo com Next.js (frontend) + Fastify (backend) + PostgreSQL + Redis
**Padrão**: Orquestração multi-agente com agentes simulados e dados mockados
**Abordagem de Build**: Squad Paralelo (subagents) - todos os componentes criados em lotes paralelos

## Estrutura do Projeto

```
incident-center-ai/
├── demo-app/
│   ├── backend/              # API Fastify (Node.js/TypeScript)
│   │   ├── prisma/
│   │   │   └── schema.prisma # Modelos de dados
│   │   └── src/
│   │       ├── utils/        # db, queue, otel, mock-data
│   │       ├── services/     # Lógica de negócios (6 serviços)
│   │       ├── routes/       # Endpoints da API (6 arquivos de rota)
│   │       └── index.ts      # Entry point do Fastify
│   └── frontend/             # Next.js 15 (App Router)
│       └── src/
│           ├── app/          # Layout, page, globals.css
│           ├── lib/          # utils, api client
│           └── components/
│               ├── ui/       # 7 componentes UI
│               └── dashboard/ # 3 componentes de dashboard
├── observability/            # Configurações do Prometheus, Loki, Grafana
├── docker-compose.yml        # Orquestração local
└── docs/                     # PRD e tech spec
```

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15, React 19, TailwindCSS, primitivas shadcn/ui |
| Backend | Fastify, TypeScript, Prisma ORM |
| Banco de Dados | PostgreSQL 16 |
| Fila | Redis + BullMQ |
| Observabilidade | OpenTelemetry, Prometheus, Loki, Grafana |
| DevOps | Docker Compose |

## Modelos de Dados (Prisma)

- **Incident** - Entidade principal com status, severidade e timeline
- **AgentTask** - Tarefa atribuída a agentes de IA (triage, rca, mitigation, communication, sre)
- **Message** - Comunicação entre agentes com tipo e metadados
- **Metric** - Métricas de desempenho e operacionais
- **Settings** - Configuração do sistema

## Simulação de Agentes de IA

Cinco agentes simulados com tipos de tarefa:
1. **Triage Agent** - Classificação e priorização de incidentes
2. **RCA Agent** - Análise de causa raiz
3. **Mitigation Agent** - Ações de correção
4. **Communication Agent** - Notificações para stakeholders
5. **SRE Agent** - Tarefas de engenharia de confiabilidade de site

## Endpoints da API

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | /api/incidents | Listar todos os incidentes |
| GET | /api/incidents/:id | Obter detalhes do incidente |
| POST | /api/incidents | Criar incidente |
| PATCH | /api/incidents/:id | Atualizar incidente |
| GET | /api/tasks | Listar tarefas |
| GET | /api/tasks/incident/:id | Listar tarefas por incidente |
| PATCH | /api/tasks/:id | Atualizar tarefa |
| GET | /api/messages/incident/:id | Obter mensagens do incidente |
| POST | /api/messages | Enviar mensagem |
| GET | /api/metrics/summary | Obter resumo das métricas |
| POST | /api/metrics | Registrar métrica |
| GET | /api/settings | Obter configurações |
| PATCH | /api/settings | Atualizar configurações |
| POST | /api/simulator/start | Iniciar simulação |
| POST | /api/simulator/stop | Parar simulação |
| GET | /api/simulator/status | Obter status da simulação |

## Páginas do Frontend

- **Home** (`/`) - Dashboard com estatísticas, gráficos e lista de incidentes
- **Detalhe do Incidente** (`/incidents/:id`) - Visualização completa do incidente com tarefas e mensagens

## Componentes UI

- Badge - Indicadores de status/severidade
- Card - Container de conteúdo com variante StatCard
- Button - Elementos interativos
- Input - Campo de texto de formulário
- Select - Seleção em dropdown
- Table - Exibição de dados
- MessageList - Feed de comunicação entre agentes

## Observabilidade

- **Prometheus** (porta 9090) - Coleta de métricas
- **Grafana** (porta 3002) - Dashboards e visualização
- **Loki** (porta 3100) - Agregação de logs

## Serviços Docker

| Serviço | Porta | Finalidade |
|---------|-------|-----------|
| postgres | 5432 | Banco de dados |
| redis | 6379 | Backend de fila |
| backend | 3001 | Servidor API |
| frontend | 3000 | Aplicação Next.js |
| prometheus | 9090 | Métricas |
| grafana | 3002 | Dashboards |
| loki | 3100 | Logs |

## Notas sobre a Abordagem de Build

- Todos os arquivos gerados em lotes paralelos usando chamadas de ferramentas concorrentes
- Nenhum comando de linting/typechecking disponível (projeto demo)
- Dados mockados usados para todos os agentes e incidentes
- Atualizações em tempo real simuladas via polling
- Modo escuro suportado via variáveis CSS e classes Tailwind dark:
