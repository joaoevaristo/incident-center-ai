# Git Strategy - Incident Center AI

## Branch Model

Adotamos **Git Flow simplificado** com adaptações para multi-agent development e SDD (Software Defined Development).

### Branches Principais

| Branch | Propósito | Proteção |
|---|---|---|
| `main` | Código em produção / demo pronta | Protegida - require PR + 2 approvals |
| `develop` | Integração de features em andamento | Protegida - require PR + 1 approval |
| `feature/*` | Novas funcionalidades | Livre |
| `bugfix/*` | Correções não críticas | Livre |
| `hotfix/*` | Correções urgentes em produção | Livre - merge direto em main + develop |
| `release/*` | Preparação de release | Protegida - require PR + 2 approvals |
| `agent/*` | Experimentação de agentes/simulação | Livre |

### Fluxo de Trabalho

```
main ────────────────────────●──────────────────────●
                            / \                     / \
                           /   ● release/1.0       /   ●
              feature/x  ●/                    feature/y/
                         /                     /
    develop ●────────●────────●────●────●────●
            \       / \      /    /    /    /
             ●  ●●     ●●●●    /    /    /
            /  /         \   /    /    /
    agent/ ● ●   agent/●   ●     /    /
         tri   rca        mit   /    /
                            comm  /
                                sre
```

## Estratégia de Colaboração Multi-Agent

### Ownership por Subagent

Cada subagent opera em domínios isolados com boundaries claras:

| Subagent | Domínio | Path |
|---|---|---|
| Backend Agent | API, services, routes | `demo-app/backend/` |
| Frontend Agent | UI, components, pages | `demo-app/frontend/` |
| Agent Orchestrator | Agent logic, simulation | `demo-app/backend/src/agents/` |
| Observability Agent | Metrics, logging, tracing | `observability/` |
| DevOps Agent | Docker, CI/CD, infra | `docker-compose.yml`, `.github/` |

### Sincronização entre Subagents

1. **Contratos de API documentados** em `docs/squad/tech-spec/`
2. **Checkpoints diários** via status updates no `docs/squad/build-metrics.md`
3. **Merge em develop** a cada feature completa para validação de integração
4. **Revisão cruzada** obrigatória entre frontend e backend agents

## Merge Strategy

| Tipo de Branch | Strategy | Squash |
|---|---|---|
| feature/* → develop | Rebase + Merge | Não |
| release/* → main | Merge (preserve history) | Não |
| hotfix/* → main + develop | Merge (preserve history) | Não |
| agent/* → develop | Squash Merge | Sim |

## Commit Convention

Seguimos **Conventional Commits** com prefixes:

| Prefix | Domínio | Exemplo |
|---|---|---|
| `feat` | Nova funcionalidade | `feat: add triage agent simulation` |
| `fix` | Correção de bug | `fix: resolve race condition in simulator` |
| `refactor` | Refatoração sem mudança de comportamento | `refactor: extract metric formatting logic` |
| `chore` | Manutenção, configs, deps | `chore: update docker-compose volumes` |
| `docs` | Documentação | `docs: add git strategy documentation` |
| `test` | Testes | `test: add integration tests for incidents API` |
| `ci` | CI/CD pipeline | `ci: add automated linting workflow` |
| `perf` | Otimização de performance | `perf: optimize incident list pagination` |
| `agent` | Mudanças em agents/simulação | `agent: add RCA root cause analysis` |

Formato: `<type>(<scope>): <description>`

Exemplos:
```
feat(backend): add automated communication agent
feat(frontend): add incident detail dashboard
agent(orchestrator): implement RCA analysis pipeline
ci(deploy): add Vercel preview deploy workflow
```

## Release Strategy

| Release | Frequency | Content |
|---|---|---|
| `v0.x.x` (alpha) | Semanal | Features experimentais, agent iterations |
| `v1.0.0` (beta) | Quinzenal | Demo estável, features completas |
| `v1.x.x` (stable) | Mensal | Release de produção com breaking changes controlados |
