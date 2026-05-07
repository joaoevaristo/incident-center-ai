# CI/CD Automation Strategy - Incident Center AI

## Overview

Estratégia de automações para garantir qualidade, consistência e deploy confiável do Incident Center AI.
Inicialmente simplificado, com evolução planejada.

## Phase 1: Foundation (Current)

### Pre-commit Hooks

**Tool:** Husky + lint-staged

**Configuração:**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**O que faz:**
- Lint e format em todos os arquivos staged
- Bloqueia commits com código sujo
- Enforce conventional commits via commitlint

### Commit Message Validation

**Tool:** Commitlint

**Configuração:**
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'refactor', 'chore',
      'docs', 'test', 'ci', 'perf', 'agent'
    ]]
  }
};
```

## Phase 2: CI Pipeline

### GitHub Actions Workflow

**Arquivo:** `.github/workflows/ci.yml`

**Stages:**

#### Stage 1: Validate (Pull Request)

```yaml
name: CI - Validate
on: [pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm test
```

#### Stage 2: Build (Push to develop/main)

```yaml
name: CI - Build
on:
  push:
    branches: [develop, main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: demo-app/frontend/.next/
```

## Phase 3: CD Pipeline

### Preview Deploys (Pull Requests)

**Platform:** Vercel

**Configuração:**
```json
{
  "github": {
    "silent": true,
    "autoJobCancelation": true
  }
}
```

**Comportamento:**
- Cada PR gera um preview deploy automático
- URL: `https://pr-123.incident-center-ai.vercel.app`
- Deploy em ~2-3 minutos
- Comentário automático com URL no PR

### Production Deploys (main branch)

**Platform:** Vercel + Railway (backend services)

**Workflow:**
```yaml
name: CD - Production Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          scope: ${{ secrets.VERCEL_SCOPE }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-args: '--prod'
          working-directory: ./demo-app/frontend
```

## Phase 4: Quality Gates

### Automated Checks

| Gate | Tool | Threshold | Status |
|---|---|---|---|
| Lint | ESLint | 0 errors | ✅ Planned |
| Type Check | TypeScript | 0 errors | ✅ Planned |
| Test Coverage | Jest | > 70% | ✅ Planned |
| Bundle Size | webpack-bundle-analyzer | < 250KB gzipped | ✅ Planned |
| Security | npm audit | 0 high/critical | ✅ Planned |
| PR Size | Custom | < 500 lines | ✅ Planned |

### Quality Gate Configuration

```yaml
# .github/quality-gates.yml
quality_gates:
  max_pr_size: 500
  min_test_coverage: 70
  max_bundle_size_kb: 250
  forbidden_dependencies:
    - debug
    - console-log
  required_headers:
    - License
    - Author
```

## Future Evolutions

### Phase 5: Advanced Automation

#### Automated E2E Tests
- **Tool:** Playwright
- **When:** After each successful build
- **What:** Critical user flows tested in staging

#### Automated Performance Tests
- **Tool:** Lighthouse CI
- **When:** On every PR
- **What:** Performance budget enforcement

#### Automated Security Scans
- **Tool:** Snyk / Dependabot
- **When:** Daily + on PR
- **What:** Dependency vulnerabilities

#### Database Migration Validation
- **Tool:** Prisma migrate validate
- **When:** On PR with schema changes
- **What:** Migration compatibility check

### Phase 6: Observability Integration

#### Automated Monitoring
- **Tool:** Grafana + Prometheus
- **When:** Post-deploy
- **What:** Smoke tests via metrics

#### Automated Rollback
- **Trigger:** Error rate > 5% in 5 minutes
- **Action:** Automatic rollback to previous stable version
- **Notification:** Slack + Email alert

## Implementation Priority

| Phase | Priority | Effort | Impact |
|---|---|---|---|
| Pre-commit hooks | High | Low | High |
| Commit validation | High | Low | Medium |
| CI: lint + typecheck | High | Low | High |
| CI: tests | High | Medium | High |
| Preview deploys | Medium | Medium | High |
| Production deploy | Medium | Medium | High |
| Quality gates | Medium | Low | Medium |
| E2E tests | Low | High | Medium |
| Security scans | Low | Low | Medium |
| Auto rollback | Low | High | High |

## Quick Start

Para ativar as automações:

```bash
# 1. Install dev dependencies
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 2. Install husky
npx husky init

# 3. Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# 4. Add commitlint
npm install -D @commitlint/cli @commitlint/config-conventional
npx husky add .husky/commit-msg "npx -- --config commitlint.config.js -e $HUSKY_GIT_PARAMS"

# 5. Create GitHub Actions workflow
# See .github/workflows/ci.yml
```
