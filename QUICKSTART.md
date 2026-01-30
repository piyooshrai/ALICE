# ALICE - Quick Start Guide

Get ALICE running in 10 minutes.

## Prerequisites

- Vercel account
- PostgreSQL database
- Gmail account for SMTP

## 5-Step Setup

### 1. Generate Credentials (2 min)

```bash
cd ALICE
python3 setup.py
```

Follow prompts, save all generated keys.

### 2. Deploy Server (3 min)

```bash
cd alice-server
vercel --prod
```

In Vercel dashboard, add environment variables from step 1.

### 3. Setup Database (2 min)

```bash
# Get DATABASE_URL from Vercel
vercel env pull
psql $DATABASE_URL -f database/schema.sql
```

### 4. Deploy Dashboard (2 min)

```bash
cd ../alice-dashboard
npm install
vercel --prod
```

Add environment variables:
- API_BASE_URL (your server URL)
- ADMIN_API_KEY (from step 1)

### 5. Install SDK (1 min)

```bash
cd ../alice-sdk
npm install -g .
alice init
```

## Test It

```bash
cd ../test-project
alice analyze
```

Expected:
- Score: 20-30
- Grade: D
- Status: BLOCKED
- 10+ issues found

## Access Dashboard

Visit: `https://your-dashboard.vercel.app`

## Create Your Project

```bash
curl -X POST https://your-server.vercel.app/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My App", "admin_key": "YOUR_ADMIN_KEY"}'
```

Save the API key, configure SDK:

```bash
alice config --set-key alice_xxxxx
```

## Start Analyzing

```bash
cd your-project
alice analyze
```

## Done!

You now have:
- ✓ Deployed server analyzing code
- ✓ Dashboard tracking grades
- ✓ SDK installed locally
- ✓ Automatic email reports

See README.md for full documentation.
