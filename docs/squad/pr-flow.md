# PR Flow - Incident Center AI

## PR Organization

### Structure
- Cada PR deve cobrir **uma única concern** (feature, bugfix, refactor)
- Features complexas podem ser divididas em PRs menores relacionados
- PRs não devem misturar frontend + backend sem necessidade (priorizar separação)

### Naming Convention

Formato: `<type>(<scope>): <subject>`

| Type | Description |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração de código |
| `chore` | Manutenção, configs, deps |
| `docs` | Documentação |
| `test` | Adição/modificação de testes |
| `ci` | Mudanças no CI/CD |
| `perf` | Otimização de performance |
| `agent` | Mudanças em agentes/simulação |

Exemplos:
```
feat(backend): add automated communication agent
feat(frontend): add incident detail dashboard
agent(orchestrator): implement RCA analysis pipeline
ci(deploy): add Vercel preview deploy workflow
fix(backend): resolve race condition in simulator
```

## Review Policy

### Reviewers Required

| Change Type | Min. Reviewers | Domain Review |
|---|---|---|
| Feature (single domain) | 1 | Owner do domínio |
| Feature (cross-domain) | 2 | Frontend + Backend |
| Agent/Simulation | 1 | Agent Orchestrator |
| Observability | 1 | Observability Agent |
| Infra/CI/CD | 1 | DevOps Agent |
| Hotfix | 1 | Urgente - merge rápido |
| Breaking change | 2 | Arquiteto + Domain Owner |

### Code Review Checklist

- [ ] Código segue as convenções do projeto
- [ ] Commits seguem Conventional Commits
- [ ] Testes adicionados/atualizados (se aplicável)
- [ ] Documentação atualizada (se aplicável)
- [ ] Sem segredos/credenciais expostos
- [ ] Change log atualizado (se breaking change)
- [ ] Performance considerada
- [ ] Security considerations addressadas

## Merge Policy

### Merge Strategies

| Branch Target | Strategy | Conditions |
|---|---|---|
| `feature/*` → `develop` | Rebase + Merge | CI passing, 1+ approval |
| `release/*` → `main` | Merge (no squash) | CI passing, 2+ approvals |
| `hotfix/*` → `main` | Merge (no squash) | CI passing, 1+ approval |
| `agent/*` → `develop` | Squash Merge | CI passing, 1+ approval |

### Branch Protection Rules

**`main`:**
- Require pull request reviews (min. 2 approvals)
- Require status checks to pass (CI, lint, typecheck)
- Require linear history (no squash)
- Restrict pushes (no direct pushes)
- Require signed commits

**`develop`:**
- Require pull request reviews (min. 1 approval)
- Require status checks to pass
- Restrict pushes (no direct pushes)

**`release/*`:**
- Require pull request reviews (min. 2 approvals)
- Require status checks to pass
- Restrict pushes

## Squash/Rebase Strategy

| Scenario | Strategy | Rationale |
|---|---|---|
| Feature branches | Rebase before merge | Mantém history limpa em develop |
| Agent experimentation | Squash | Commits experimentais são ruído |
| Release branches | No squash | Preserva histórico de release |
| Hotfix | No squash | Rastreabilidade de emergência |
| Small fixes (< 2 commits) | Squash optional | Facilita leitura |

## Commit Granularity

### Guidelines

- **Commits atômicos**: Cada commit deve representar uma mudança lógica completa
- **Não quebrar build**: Cada commit deve passar em lint e typecheck
- **Commits não devem**:
  - Misturar features não relacionadas
  - Incluir debug code em production
  - Contener secrets ou dados sensíveis
  - Quecar funcionalidades existentes sem motivo

### Commit Size Guidelines

| Metric | Recommendation |
|---|---|
| Max lines changed | 400 lines/commit |
| Max files changed | 10 files/commit |
| Ideal PR size | 5-15 commits |
| Max PR size | 50 commits |

Se um PR excede 50 commits ou 4000 linhas, deve ser dividido.

## Approval Criteria

### Definition of Done

- [ ] Código revisado e aprovado por ≥ 1 reviewer (≥ 2 para changes críticos)
- [ ] Todos os checks de CI passing
- [ ] Commits seguem Conventional Commits
- [ ] Sem warnings de lint ou typecheck
- [ ] Testes passam (se aplicável)
- [ ] Documentação atualizada (se necessário)
- [ ] Sem merge conflicts com target branch
- [ ] Change log atualizado (breaking changes)

### Definition of Ready (para review)

- [ ] PR description completa
- [ ] Screenshots/ GIFs (para mudanças frontend)
- [ ] Contexto arquitetural documentado
- [ ] Riscos identificados e mitigados
- [ ] Labels aplicadas corretamente
- [ ] Linked issues/PRs relacionados
