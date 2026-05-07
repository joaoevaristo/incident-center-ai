# Architect Collaboration Model - Incident Center AI

## Overview

Este documento define como a squad de desenvolvimento (subagents) colabora com o arquiteto do time durante todo o ciclo de vida do projeto Incident Center AI.

## Architect Checkpoints

### Checkpoint 1: Design Phase (Antes do desenvolvimento)

**Quando:** Antes de iniciar qualquer implementação
**O que revisar:**
- Tech Spec completo
- Data model e schema
- API contracts (OpenAPI/Swagger)
- Event definitions e message contracts
- Architecture diagramas
- Trade-offs técnicos documentados

**Gate de aprovação:** Tech Spec aprovado pelo arquiteto antes de qualquer código ser escrito.

### Checkpoint 2: Contract Review (Durante desenvolvimento)

**Quando:** Quando novos endpoints, events ou data models são adicionados
**O que revisar:**
- Novos API endpoints seguem conventions
- Event schemas são backward-compatible
- Data model follows normalization rules
- Error handling contracts consistentes

**Gate de aprovação:** Contracts aprovados antes de merge em develop.

### Checkpoint 3: Integration Review (Antes de release)

**Quando:** Quando múltiplas features são integradas
**O que revisar:**
- Cross-service communication patterns
- Data flow entre components
- Performance implications de integrações
- Observability coverage (metrics, logs, traces)

**Gate de aprovação:** Integration review aprovado antes de merge em main.

### Checkpoint 4: Post-Mortem Review (Depois de incidents)

**Quando:** Após qualquer incident em produção ou demo
**O que revisar:**
- Root cause analysis
- Monitoring gaps identificados
- Process improvements necessários
- Architecture debt accumulated

## Architecture Review Gates

### Gate 1: Architecture Decision Records (ADRs)

Toda decisão arquitetural significativa deve ser documentada como ADR:

```markdown
# ADR-XXX: [Title]

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
Qual é o problema ou oportunidade?

## Decision
Qual decisão foi tomada?

## Consequences
Quais são as consequências (positivas e negativas)?

## Alternatives Considered
Quais outras opções foram avaliadas?
```

**Regra:** Decisões com status "Accepted" requerem aprovação do arquiteto.

### Gate 2: API Contract Validation

Todos os novos endpoints devem passar por validação:

- [ ] Request/Response schemas definidos
- [ ] Error codes padronizados
- [ ] Rate limiting considerations
- [ ] Authentication/Authorization definidos
- [ ] Versioning strategy aplicada
- [ ] OpenAPI spec atualizada

### Gate 3: Event Schema Validation

Todos os novos events devem passar por validação:

- [ ] Event name segue convention (`domain.action.target`)
- [ ] Schema versioned
- [ ] Backward compatibility guaranteed
- [ ] Dead letter queue strategy definida
- [ ] Event sourcing implications analyzed

### Gate 4: Data Model Validation

Todos os novos data models devem passar por validação:

- [ ] Normalization level appropriate
- [ ] Index strategy defined
- [ ] Migration strategy planned
- [ ] Data retention policy defined
- [ ] Privacy/compliance considerations addressed

## Review Types

### API Review Checklist

- [ ] RESTful conventions followed (ou REST-ish justificado)
- [ ] HTTP status codes correct
- [ ] Request/response payload minimal e claro
- [ ] Pagination implemented for lists
- [ ] Filtering and sorting available
- [ ] Idempotency where applicable
- [ ] CORS configured
- [ ] Request validation (Zod/ Joi)

### Event Review Checklist

- [ ] Event name follows convention
- [ ] Schema versioned (v1, v2, etc.)
- [ ] Required fields documented
- [ ] Optional fields marked
- [ ] Backward compatible changes only
- [ ] Event payload minimal (no sensitive data)
- [ ] Correlation ID included
- [ ] Dead letter queue configured

### Data Model Review Checklist

- [ ] Primary key strategy clear
- [ ] Foreign keys properly defined
- [ ] Indexes for query patterns
- [ ] Soft delete where appropriate
- [ ] Audit fields (createdAt, updatedAt)
- [ ] Enum values documented
- [ ] Data types appropriate
- [ ] Constraints defined (unique, not null)

### Boundary Review Checklist

- [ ] Service boundaries clear (single responsibility)
- [ ] Cross-service calls minimized
- [ ] Synchronous vs synchronous decisions justified
- [ ] Circuit breakers for external calls
- [ ] Retry policies defined
- [ ] Timeout configurations set
- [ ] Fallback strategies defined

### Architecture Trade-off Review

Para cada decisão arquitetural, documentar:

1. **Problem:** O que estamos tentando resolver?
2. **Requirements:** Funcionais e não-funcionais
3. **Options Considered:** Mínimo 2 alternativas
4. **Decision:** O que foi escolhido
5. **Trade-offs:** O que ganhamos e perdemos
6. **Mitigation:** Como mitigamos os trade-offs negativos
7. **Reversibility:** Quão fácil é voltar atrás?

## Collaboration Workflow

### Daily Sync

- **Quando:** Diário (async via status updates)
- **Onde:** `docs/squad/build-metrics.md`
- **O que:** Progresso, blockers, decisões tomadas
- **Responsável:** Todos os subagents

### Weekly Architecture Review

- **Quando:** Semanal (agendado)
- **Onde:** Reunião síncrona
- **O que:** Review de ADRs, pending contracts, upcoming changes
- **Responsável:** Arquiteto + Team Lead

### PR Architecture Review

- **Quando:** Durante PR review
- **O que:** Impacto arquitetural da mudança
- **Quando necessário:** Para mudanças que afetam:
  - Data model changes
  - API contract changes
  - New service integrations
  - Performance-critical changes
  - Security-related changes

## Architecture Debt Management

### Tracking

- Architecture debt tracked como issues no GitHub
- Priority: High/Medium/Low
- Assigned to relevant subagent
- Linked to ADR quando aplicável

### Mitigation

- Cada sprint deve incluir time para tech debt
- Max 20% do capacity dedicado a refactoring
- Tech debt > 30 days deve ser escalated

### Prevention

- Code reviews incluem architecture consistency check
- Automated architecture checks (lint rules, type constraints)
- Regular architecture health assessments

## Escalation Path

Quando subagents encontram questões arquiteturais não resolvidas:

1. **Level 1:** Documentar em ADR, continuar trabalhando (não-blocking)
2. **Level 2:** Escalate para architect via PR comment ou issue
3. **Level 3:** Escalate para architect + team lead sync
4. **Level 4:** Escalate para engineering management

**Regra:** Nunca bloquear desenvolvimento por mais de 2 dias esperando review arquitetural. Documentar a decisão e continuar.

## Communication Channels

| Channel | Purpose | Frequency |
|---|---|---|
| GitHub Issues | Architecture debt, bugs, features | As needed |
| PR Comments | Code review, contract validation | Per PR |
| ADRs | Architecture decisions | Per decision |
| Build Metrics | Progress tracking | Daily |
| Weekly Meeting | Sync, blockers, planning | Weekly |
