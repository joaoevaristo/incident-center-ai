#!/bin/bash

# Deployment script for Incident Center AI
# This script sets up Railway services and deploys the application

set -e

echo "========================================"
echo "  Incident Center AI - Deployment Setup"
echo "========================================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "Step 1: Setup Railway Backend"
echo "------------------------------"
echo ""
echo "1. Login to Railway:"
echo "   railway login"
echo ""
echo "2. Initialize Railway project (if not done):"
echo "   cd demo-app/backend"
echo "   railway init"
echo ""
echo "3. Add PostgreSQL service:"
echo "   railway service add postgres"
echo ""
echo "4. Add Redis service:"
echo "   railway service add redis"
echo ""
echo "5. Link services to project:"
echo "   cd demo-app/backend"
echo "   railway link"
echo ""
echo "6. Deploy backend:"
echo "   railway up"
echo ""
echo "7. Get backend URL:"
echo "   railway variables | grep URL"
echo ""

echo "Step 2: Setup Vercel Frontend"
echo "------------------------------"
echo ""
echo "1. Login to Vercel:"
echo "   vercel login"
echo ""
echo "2. Initialize Vercel project:"
echo "   cd demo-app/frontend"
echo "   vercel init"
echo ""
echo "3. Set environment variables:"
echo "   vercel env add NEXT_PUBLIC_API_URL"
echo ""
echo "4. Deploy frontend:"
echo "   vercel --prod"
echo ""

echo "Step 3: Verify Deployment"
echo "------------------------------"
echo ""
echo "1. Check backend health:"
echo "   curl https://<backend-url>/health"
echo ""
echo "2. Access frontend:"
echo "   open https://<frontend-url>"
echo ""
echo "3. Test simulator:"
echo "   curl -X POST https://<backend-url>/api/simulator/start"
echo ""

echo "========================================"
echo "  Deployment setup complete!"
echo "========================================"
