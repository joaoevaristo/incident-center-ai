# Environment Variables - Incident Center AI

## Overview

This document provides a complete reference for all environment variables required to run the Incident Center AI application across different environments (local development, Railway production, Vercel production).

## Backend (Railway)

### Required Variables

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `PORT` | Server port | `3000` | No (default: 3000) |
| `HOST` | Server host | `0.0.0.0` | No (default: 0.0.0.0) |
| `LOG_LEVEL` | Logging level | `info` | No (default: info) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | **Yes** |
| `REDIS_URL` | Redis connection string | `redis://:password@host:6379` | **Yes** |
| `JWT_SECRET` | JWT signing secret | `your-jwt-secret-here-min-32-chars` | No (demo only) |
| `OTEL_ENABLED` | Enable OpenTelemetry | `false` | No (default: false) |
| `CORS_ORIGIN` | Allowed CORS origins | `*` or `https://frontend.vercel.app` | No (default: *) |

### Railway Service Variables

When deploying to Railway, these variables are automatically set by Railway services:

- **PostgreSQL**: Railway provides `DATABASE_URL` automatically when you add a PostgreSQL service
- **Redis**: Railway provides `REDIS_URL` automatically when you add a Redis service

### How to Set Variables in Railway

1. Go to your Railway project dashboard
2. Select the backend service
3. Go to the "Variables" tab
4. Add each variable with its value
5. Redeploy the service for changes to take effect

### Variable Sources

```bash
# PostgreSQL (Railway auto-provides)
DATABASE_URL=postgresql://railway:user:password@postgres.railway.internal:5432/railway

# Redis (Railway auto-provides)
REDIS_URL=redis://:password@redis.railway.internal:6379
```

## Frontend (Vercel)

### Required Variables

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://backend-production.railway.app` | **Yes** |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Incident Center AI` | No |
| `NEXT_PUBLIC_VERSION` | Application version | `1.0.0` | No |

### Vercel Environment Variables

Set in Vercel dashboard:
1. Go to your Vercel project
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable
4. Select the appropriate environment (Production, Preview, Development)
5. Redeploy for changes to take effect

## Local Development

### Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in the values:
```bash
# Database (local PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/incident_center

# Redis (local Redis)
REDIS_URL=redis://localhost:6379
```

3. Start services with Docker Compose:
```bash
docker-compose up -d postgres redis
```

4. Run database migrations:
```bash
cd demo-app/backend
npx prisma migrate dev
```

5. Start the application:
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd ../frontend
npm run dev
```

## Production Deployment Checklist

### Railway Backend

- [ ] Create Railway project
- [ ] Add PostgreSQL service
- [ ] Add Redis service
- [ ] Set `DATABASE_URL` (auto-provided by Railway)
- [ ] Set `REDIS_URL` (auto-provided by Railway)
- [ ] Set `CORS_ORIGIN` to your Vercel frontend URL
- [ ] Set `LOG_LEVEL` to `info` or `warn`
- [ ] Deploy backend service
- [ ] Verify health check: `curl https://backend-url/health`
- [ ] Run database migrations: `railway run npx prisma migrate deploy`

### Vercel Frontend

- [ ] Create Vercel project
- [ ] Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
- [ ] Set `NEXT_PUBLIC_APP_NAME` to your application name
- [ ] Deploy frontend
- [ ] Verify frontend loads correctly
- [ ] Test API connectivity from frontend

## Security Notes

- **Never commit `.env` files** to version control
- Use strong, unique secrets for production
- Rotate secrets regularly
- Use Railway/Vercel built-in secret management for production
- Enable HTTPS for all production endpoints
- Set `CORS_ORIGIN` to specific domains in production

## Troubleshooting

### Backend won't start
- Check `DATABASE_URL` is correct and database is accessible
- Check `REDIS_URL` is correct and Redis is accessible
- Check logs: `railway logs`

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Check network connectivity between Vercel and Railway

### Database migration fails
- Ensure `DATABASE_URL` is pointing to the correct database
- Run `npx prisma migrate deploy` manually
- Check Railway PostgreSQL service is running
