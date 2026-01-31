# ALICE - Ready for Production

Everything is built and committed. Here's what you need to do to make it work with real projects.

## Current Status

✅ **Dashboard** - Deployed on Vercel (currently showing mock data)
✅ **Server Code** - Ready to deploy (Python backend with analyzers)
✅ **SDK** - Ready to give to developers
✅ **Database Schema** - SQL ready to run
✅ **Email System** - Amazon SES integration complete

## What You Need to Do

### 1. Deploy the Server (30 minutes)

The server is NOT deployed yet. The dashboard is, but it needs the server to get real data.

```bash
cd alice-server

# Deploy to Vercel
vercel --prod
# When prompted:
# - Project name: alice-server
# - Root directory: (leave empty)
# - Framework: Other

# You'll get a URL like: https://alice-server-xxxxx.vercel.app
```

### 2. Configure Vercel Environment Variables

In Vercel Dashboard → alice-server → Settings → Environment Variables, add:

**Required:**
- `DATABASE_URL` - Your Postgres connection string
- `ENCRYPTION_KEY` - Generate with: `python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
- `AWS_ACCESS_KEY_ID` - From AWS IAM
- `AWS_SECRET_ACCESS_KEY` - From AWS IAM
- `AWS_REGION` - us-east-1
- `SES_SENDER_EMAIL` - noreply@the-algo.com (must be verified in SES)
- `ADMIN_EMAIL` - piyoosh.rai@the-algo.com
- `ADMIN_API_KEY` - Generate with: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`

After adding all variables, redeploy.

### 3. Setup Database

**Get Vercel Postgres:**
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Copy the `DATABASE_URL`
3. Add to environment variables

**Run Schema:**
```bash
psql YOUR_DATABASE_URL -f alice-server/database/schema.sql
```

This creates all tables.

### 4. Setup Amazon SES

**Verify Sender Email:**
1. AWS SES Console → Verified Identities → Create Identity
2. Enter: noreply@the-algo.com
3. Check email and verify

**Create IAM User:**
1. IAM Console → Users → Create User: alice-ses
2. Attach Policy: AmazonSESFullAccess
3. Create Access Key → Save both keys

**Request Production Access:**
SES starts in sandbox (can only email verified addresses).
To email any developer: SES Console → Request Production Access

### 5. Create First Project

Once server is deployed:

```bash
curl -X POST https://your-alice-server.vercel.app/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "admin_key": "YOUR_ADMIN_API_KEY"
  }'
```

Save the API key from response - give this to developers.

### 6. Give SDK to Developers

Developers run:

```bash
# Install
cd alice-sdk
npm install -g .

# Configure
alice init
# Enter API key from step 5
# Enter server URL
# Enter their name/email

# Analyze code
cd their-project
alice analyze
```

### 7. Switch Dashboard to Real Data

Currently dashboard uses mock data. To use real data:

```bash
cd alice-dashboard

# Switch to production API
mv lib/api.ts lib/api-mock.ts
mv lib/api-production.ts lib/api.ts

# Add environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-server.vercel.app
# NEXT_PUBLIC_ADMIN_KEY=your_admin_key

# Commit and push (auto-deploys)
git add lib/
git commit -m "Switch to production API"
git push
```

Dashboard will now show real analyses from database.

## What Happens When It Works

1. Developer runs `alice analyze`
2. Code uploads to your server
3. Server analyzes code (25+ vulnerability patterns)
4. Server calculates grade and score
5. Server stores in database
6. Server sends 2 emails via SES:
   - **To developer:** Technical bugs only
   - **To you:** Full assessment with grade
7. Dashboard updates with new analysis
8. You see grades, trends, history

## Quick Test

After everything is set up:

```bash
cd test-project
alice analyze
```

Check:
- ✅ Terminal shows bugs found
- ✅ Developer email received (technical)
- ✅ Your email received (assessment with grade)
- ✅ Dashboard shows new analysis

## Files You Need

All in your repo:
- `PRODUCTION_SETUP.md` - Detailed step-by-step guide
- `alice-server/` - Python backend (deploy this)
- `alice-dashboard/` - Next.js UI (already deployed)
- `alice-sdk/` - CLI for developers
- `database/schema.sql` - Database structure

## Summary

**What's Done:**
- All code written and tested
- Dashboard deployed (showing mock data)
- Server code ready to deploy
- SDK ready to install

**What You Need to Do:**
1. Deploy alice-server to Vercel (30 min)
2. Setup Vercel Postgres database (10 min)
3. Configure Amazon SES (20 min)
4. Create first project via API (2 min)
5. Switch dashboard to production API (5 min)
6. Test with test-project (5 min)

**Total Time:** ~1-2 hours to go fully live

Then you can give the SDK to developers and start getting real code analysis with grades and assessments.
