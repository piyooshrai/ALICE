# ALICE Production Setup Guide

Complete guide to deploy ALICE with real database, Amazon SES emails, and live analysis.

## Prerequisites

- Vercel account (for hosting)
- PostgreSQL database (Vercel Postgres recommended)
- AWS account with SES configured
- Verified sender email in Amazon SES

## Step 1: Setup PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. Go to Vercel Dashboard
2. Create new Postgres database
3. Copy `DATABASE_URL` from dashboard
4. Save for Vercel environment variables

### Option B: External PostgreSQL

Use any PostgreSQL provider (AWS RDS, Supabase, etc.)

### Deploy Schema

Once you have your DATABASE_URL:

```bash
# Install psql if needed
# Connect and run schema
psql YOUR_DATABASE_URL -f alice-server/database/schema.sql
```

This creates all tables: projects, developers, analyses, bugs, reports

## Step 2: Setup Amazon SES

### Verify Sender Email

1. Go to AWS SES Console
2. Go to **Verified Identities**
3. Click **Create Identity**
4. Choose **Email address**
5. Enter: `noreply@the-algo.com` (or your domain)
6. Verify via email

### Create IAM User for SES

1. Go to IAM Console
2. Create new user: `alice-ses-sender`
3. Attach policy: `AmazonSESFullAccess`
4. Create access key
5. Save:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### Request Production Access

By default, SES is in sandbox mode (can only send to verified emails).

To send to any developer email:
1. SES Console → **Account Dashboard**
2. Click **Request production access**
3. Fill form (usually approved in 24 hours)

OR for testing: Verify each developer's email in SES

## Step 3: Generate Secure Keys

Run this to generate encryption key:

```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Generate admin API key:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Save both - you'll need them for Vercel.

## Step 4: Deploy ALICE Server to Vercel

### 4.1 Create New Vercel Project for Server

```bash
cd alice-server
vercel
```

- Project name: `alice-server`
- Root directory: Leave empty (already in alice-server)
- Framework: `Other`

### 4.2 Set Environment Variables in Vercel

Go to Vercel Dashboard → alice-server project → Settings → Environment Variables

Add these:

```bash
DATABASE_URL=your_postgres_url_here
ENCRYPTION_KEY=your_fernet_key_here
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_here
SES_SENDER_EMAIL=noreply@the-algo.com
ADMIN_EMAIL=piyoosh.rai@the-algo.com
ADMIN_API_KEY=your_admin_key_here
```

### 4.3 Deploy to Production

```bash
vercel --prod
```

Save the deployment URL (e.g., `https://alice-server.vercel.app`)

## Step 5: Create First Project

Use the API to create a project and get API key for developers:

```bash
curl -X POST https://alice-server.vercel.app/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Project",
    "admin_key": "YOUR_ADMIN_API_KEY"
  }'
```

Response:
```json
{
  "project_id": "uuid-here",
  "api_key": "alice_xxxxx",
  "name": "My First Project"
}
```

**SAVE THE API KEY** - give this to developers

## Step 6: Connect Dashboard to Real API

### 6.1 Update Dashboard Environment

In Vercel Dashboard → alice-dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://alice-server.vercel.app
NEXT_PUBLIC_ADMIN_KEY=your_admin_api_key_here
```

### 6.2 Switch to Production API

The dashboard currently uses mock data. To use real data:

1. Rename `lib/api.ts` to `lib/api-mock.ts`
2. Rename `lib/api-production.ts` to `lib/api.ts`
3. Commit and push

```bash
cd alice-dashboard
mv lib/api.ts lib/api-mock.ts
mv lib/api-production.ts lib/api.ts
git add lib/
git commit -m "Switch dashboard to production API"
git push
```

Vercel will auto-deploy and dashboard will show real data from database.

## Step 7: Give SDK to Developers

### 7.1 Publish SDK (Optional)

```bash
cd alice-sdk
npm publish
```

OR developers can install directly from your repo:

```bash
npm install -g /path/to/alice-sdk
```

### 7.2 Developer Setup

Give developers:
1. The API key from Step 5
2. Installation instructions:

```bash
# Install SDK
npm install -g @the-algorithm/alice

# Configure
alice init
# Enter:
# - API key: alice_xxxxx
# - Server URL: https://alice-server.vercel.app
# - Name: Developer Name
# - Email: developer@email.com

# Analyze code
cd my-project
alice analyze
```

## Step 8: Test End-to-End

### Test with Sample Project

```bash
cd test-project
alice analyze
```

You should receive:
1. **Analysis completes** - shows bugs in terminal
2. **Developer email** - Technical report sent to developer email
3. **Your email** - Management assessment sent to piyoosh.rai@the-algo.com
4. **Dashboard updates** - Check your dashboard, new analysis appears

### Verify Dashboard

Visit your dashboard URL and check:
- New developer appears in `/developers`
- Analysis shows in main dashboard
- Grade and score calculated
- Can click "View History" to see full assessment

## What Happens When Developer Runs Analysis

1. **Developer runs:** `alice analyze`
2. **SDK uploads code** to alice-server
3. **Server analyzes:**
   - Frontend issues (React, performance, accessibility)
   - Backend issues (SQL injection, auth, errors)
   - Security vulnerabilities
   - Code quality
4. **Server calculates:**
   - Quality score (50-100)
   - Letter grade (A+ to D)
   - Role level (Senior/Mid/Junior/Entry)
   - Deployment status (APPROVED/CAUTION/BLOCKED)
5. **Server stores** in PostgreSQL database
6. **Server sends 2 emails via SES:**
   - **To Developer:** Technical bugs only (no grade)
   - **To You:** Full assessment with grade, strengths, weaknesses
7. **Developer sees:** Bug list in terminal
8. **You see:** Dashboard updates with new analysis

## Email Examples

### Developer Receives (Technical Only):

```
Subject: Code Analysis Report - My Project

Quality Score: 78%
Deployment Status: APPROVED

Issues Found:
1. [HIGH] Missing error handling in async operation
   Location: api/users.ts:45
   Fix: Add try/catch block

2. [MEDIUM] Missing accessibility attributes
   Location: Button.tsx:22
   Fix: Add aria-label
```

### You Receive (Full Assessment):

```
Subject: Developer Assessment - John Doe - Grade B - 2024-01-31

Grade: B
Role Level: Mid-Level
Quality Score: 78%

Strengths:
- Good code organization
- Proper authentication

Areas for Improvement:
- Missing error handling
- Accessibility issues

Performance Rating: MEETS EXPECTATIONS
```

## Troubleshooting

### Emails Not Sending

Check:
- SES sender email is verified
- AWS credentials are correct in Vercel
- SES is out of sandbox (or recipient emails are verified)
- Check Vercel function logs for errors

### Dashboard Shows No Data

Check:
- Environment variables set in Vercel
- API URL is correct
- Admin API key matches server
- Database has data (run: `psql $DATABASE_URL -c "SELECT COUNT(*) FROM analyses;"`)

### Analysis Fails

Check:
- API key is correct
- Server is deployed and accessible
- Database connection works
- Check server logs in Vercel

## Production Checklist

- [ ] PostgreSQL database created and schema deployed
- [ ] Amazon SES sender email verified
- [ ] AWS IAM credentials created for SES
- [ ] Encryption key and admin key generated
- [ ] ALICE server deployed to Vercel
- [ ] All environment variables set in Vercel
- [ ] First project created via API
- [ ] Dashboard connected to production API
- [ ] Dashboard deployed with environment variables
- [ ] SDK configured with project API key
- [ ] End-to-end test completed successfully
- [ ] Both emails (technical + assessment) received

## Next Steps

1. Create projects for each application you want to monitor
2. Distribute API keys to dev teams
3. Developers install SDK and run analyses
4. Monitor dashboard for team performance
5. Review management assessment emails
6. Track developer progress over time

Your ALICE system is now production-ready and analyzing real code!
