# SDD - Vercel + Railway Deployment Strategy

## Overview

Deploy Incident Center AI on a hybrid cloud architecture:
- **Frontend**: Vercel (static/SSR hosting with edge caching)
- **Backend**: Railway (Node.js with PostgreSQL + Redis managed services)

## Architecture

```
                    ┌─────────────┐
                    │    Vercel    │
                    │  (Frontend)  │
                    └──────┬───────┘
                           │ HTTPS
                           ▼
              ┌────────────────────────┐
              │   Railway Platform     │
              │  ┌──────────────────┐  │
              │  │  Backend API     │  │
              │  │  (Fastify + Prisma)│ │
              │  └────────┬─────────┘  │
              │           │            │
              │  ┌────────▼─────────┐  │
              │  │  Worker (BullMQ) │  │
              │  └────────┬─────────┘  │
              │           │            │
              │  ┌────────▼─────────┐  │
              │  │  PostgreSQL      │  │
              │  │  (Managed)       │  │
              │  └────────┬─────────┘  │
              │           │            │
              │  ┌────────▼─────────┐  │
              │  │  Redis           │  │
              │  │  (Managed)       │  │
              │  └──────────────────┘  │
              └────────────────────────┘
```

## Service Breakdown

### 1. Frontend (Vercel)

**Service**: Next.js application
**Platform**: Vercel
**Build Command**: `cd demo-app/frontend && npm run build`
**Output Directory**: `demo-app/frontend/.next`
**Framework**: Next.js v14

**Features**:
- Edge caching for static pages
- SSR for dashboard pages
- API rewrites to Railway backend
- Automatic HTTPS/SSL

### 2. Backend API (Railway)

**Service**: Fastify REST API server
**Platform**: Railway
**Build Command**: `cd demo-app/backend && npm run build`
**Start Command**: `cd demo-app/backend && npm start`
**Port**: 3000

**Endpoints**:
- `/api/incidents` - Incident CRUD
- `/api/tasks` - Task management
- `/api/messages` - Message history
- `/api/metrics` - Metrics queries
- `/api/settings` - System settings
- `/api/simulator` - Simulation control

### 3. Worker (Railway)

**Service**: BullMQ background worker
**Platform**: Railway
**Start Command**: `cd demo-app/backend && npm run worker`

**Responsibilities**:
- Process simulation job queues
- Generate mock incidents periodically
- Trigger agent task generation
- Update metrics periodically

### 4. PostgreSQL (Railway Managed)

**Service**: PostgreSQL 16
**Platform**: Railway Managed Database
**Usage**: Primary data store

**Schema**:
- `Incident` - Incident records
- `AgentTask` - Agent-assigned tasks
- `AgentMessage` - Communication messages
- `MetricSnapshot` - Time-series metrics
- `Setting` - System configuration

### 5. Redis (Railway Managed)

**Service**: Redis 7
**Platform**: Railway Managed Cache
**Usage**: BullMQ queues + session storage

**Queues**:
- `simulation` - Incident simulation jobs
- `agent-tasks` - Agent task processing
- `metrics` - Metric collection jobs

## Deployment Configuration

### Vercel (Frontend)

**Configuration File**: `demo-app/frontend/vercel.json`

**Environment Variables**:
- `NEXT_PUBLIC_API_URL` - Railway backend URL

**Build Configuration**:
- Framework: Next.js
- Root Directory: `demo-app/frontend`
- Output Directory: `.next`

**Routing**:
- Rewrite `/api/*` to Railway backend
- Serve static files from public/
- SPA fallback for client-side routing

### Railway (Backend)

**Configuration File**: `demo-app/backend/railway.json`

**Services**:
1. **backend-api** - Fastify server
   - Port: 3000
   - Health Check: `/api/health`
   - Restart Policy: On failure

2. **backend-worker** - BullMQ worker
   - No port needed (background process)
   - Health Check: N/A
   - Restart Policy: Always

**Managed Services**:
1. **PostgreSQL** - Primary database
   - Auto-backup enabled
   - Connection pooling: 10 connections

2. **Redis** - Queue backend
   - Max memory: 256MB
   - Persistence: AOF enabled

**Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned)
- `REDIS_URL` - Redis connection string (auto-provisioned)
- `JWT_SECRET` - Application secret
- `OTEL_ENABLED` - Enable OpenTelemetry
- `NODE_ENV` - Production

## Migration Strategy

### Phase 1: Initial Deployment

1. **Setup Railway Project**
   - Create new Railway project
   - Add PostgreSQL service
   - Add Redis service
   - Add backend-api service
   - Add backend-worker service

2. **Configure Backend Environment**
   - Set `DATABASE_URL` from Railway PostgreSQL
   - Set `REDIS_URL` from Railway Redis
   - Set `JWT_SECRET` (generate secure random)
   - Set `NODE_ENV=production`
   - Set `OTEL_ENABLED=false` (disable for demo)

3. **Deploy Backend**
   - Push code to GitHub
   - Railway auto-deploys on push
   - Run Prisma migrations on first deploy
   - Verify API health endpoint

4. **Setup Vercel Project**
   - Connect GitHub repository
   - Set `NEXT_PUBLIC_API_URL` to Railway backend URL
   - Configure build settings
   - Deploy

5. **Verify End-to-End**
   - Access frontend at Vercel URL
   - Test incident creation via simulator
   - Verify data persistence in PostgreSQL
   - Check worker processes

### Phase 2: Monitoring & Optimization

1. **Enable Health Checks**
   - Configure `/api/health` endpoint
   - Set up Railway uptime monitoring
   - Configure Vercel analytics

2. **Enable Logging**
   - Configure Railway log forwarding
   - Set up log retention policies
   - Configure Grafana for metrics visualization

3. **Enable Backups**
   - Configure PostgreSQL auto-backups
   - Set backup retention policy
   - Test restore procedure

## Environment Variables

### Backend (Railway)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://...` |
| `REDIS_URL` | Redis connection string | Yes | `redis://...` |
| `JWT_SECRET` | Secret for JWT signing | Yes | Random 32+ chars |
| `NODE_ENV` | Environment | Yes | `production` |
| `OTEL_ENABLED` | Enable OpenTelemetry | No | `false` |
| `PORT` | Server port | No | `3000` |

### Frontend (Vercel)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | `https://...` |
| `NODE_ENV` | Environment | Yes | `production` |

## Cost Estimation

### Railway

| Service | Tier | Est. Cost |
|---------|------|-----------|
| backend-api | Standard | $5/mo |
| backend-worker | Standard | $5/mo |
| PostgreSQL | Basic | $5/mo |
| Redis | Basic | $5/mo |
| **Total** | | **~$20/mo** |

### Vercel

| Service | Tier | Est. Cost |
|---------|------|-----------|
| Frontend | Pro | $20/mo |
| **Total** | | **$20/mo** |

**Total Monthly Estimate**: ~$40/mo

## Rollback Strategy

### Backend Rollback

```bash
# Railway rollback
railway up --rollback

# Or restore from Git tag
git checkout v1.0.0
# Railway auto-deploys on push
```

### Frontend Rollback

```bash
# Vercel rollback
vercel rollback

# Or restore from deployment
vercel --deployment=<previous-deployment-id>
```

## Security Considerations

1. **No secrets in code** - All secrets via Railway/Vercel env vars
2. **HTTPS only** - Both platforms enforce HTTPS
3. **CORS** - Configure Vercel domain in backend CORS settings
4. **Rate limiting** - Enable via Railway middleware
5. **Database backups** - Enable auto-backups on PostgreSQL
6. **Redis auth** - Use password-protected Redis connection

## Troubleshooting

### Common Issues

1. **Prisma migration fails**
   - Check `DATABASE_URL` is correct
   - Verify PostgreSQL is accessible
   - Run `npx prisma migrate status` locally first

2. **Worker not processing jobs**
   - Check Redis connection in Railway logs
   - Verify BullMQ queue names match
   - Check worker process is running

3. **CORS errors**
   - Add Vercel domain to backend CORS allowed origins
   - Check `NEXT_PUBLIC_API_URL` is correct

4. **Build fails on Vercel**
   - Check Node.js version compatibility
   - Verify all dependencies in package.json
   - Check build logs in Vercel dashboard

## Completed Artifacts

The following deployment files have been created:

- ✅ `demo-app/backend/Dockerfile` - Multi-stage Docker build for backend
- ✅ `demo-app/backend/railway.json` - Railway config for API service
- ✅ `demo-app/backend/railway.worker.json` - Railway config for worker service
- ✅ `demo-app/backend/src/worker.ts` - Worker entry point
- ✅ `demo-app/backend/.env.example` - Environment variable template
- ✅ `demo-app/frontend/vercel.json` - Vercel deployment configuration
- ✅ `scripts/deploy.sh` - Automated deployment script
- ✅ `docs/squad/environment-variables.md` - Complete environment variable documentation

## Next Steps

1. [ ] Create Railway project and add services (PostgreSQL, Redis, Backend API, Worker)
2. [ ] Configure environment variables in Railway dashboard
3. [ ] Deploy backend and verify health endpoint
4. [ ] Setup Vercel project and connect GitHub repository
5. [ ] Configure frontend environment variables in Vercel dashboard
6. [ ] Deploy frontend and verify end-to-end connectivity
7. [ ] Enable monitoring and backups
8. [ ] Document operational procedures
