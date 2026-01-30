# ALICE Deployment Guide

Complete step-by-step guide to deploy ALICE to production.

## Prerequisites

- Vercel account
- PostgreSQL database (Vercel Postgres recommended)
- SMTP email account (Gmail recommended)
- Node.js 18+ installed
- Python 3.11+ installed
- Git repository

## Step 1: Generate Secure Credentials

Run the setup wizard:

```bash
python3 setup.py
```

This will generate:
- Encryption key (ENCRYPTION_KEY)
- Admin API key (ADMIN_API_KEY)
- Base64 encoded email (EMAIL_USER_B64)
- Encrypted password (EMAIL_PASS_ENCRYPTED)

Save these values - you'll need them for Vercel.

## Step 2: Prepare Database

### Option A: Vercel Postgres (Recommended)

1. Go to Vercel dashboard
2. Create new Postgres database
3. Copy the connection string (DATABASE_URL)

### Option B: External PostgreSQL

1. Create database: `CREATE DATABASE alice;`
2. Note the connection string

### Deploy Schema

```bash
# If using Vercel Postgres
vercel env pull
psql $DATABASE_URL -f alice-server/database/schema.sql

# If using external database
psql -h hostname -U username -d alice -f alice-server/database/schema.sql
```

## Step 3: Deploy Server to Vercel

### 3.1: Initialize Vercel Project

```bash
cd alice-server
vercel
```

Follow prompts:
- Project name: `alice-server`
- Framework: `Other`
- Build command: (leave empty)
- Output directory: (leave empty)

### 3.2: Set Environment Variables

```bash
# Set all environment variables
vercel env add DATABASE_URL
# Paste your database connection string

vercel env add ENCRYPTION_KEY
# Paste encryption key from setup.py

vercel env add EMAIL_HOST
# smtp.gmail.com

vercel env add EMAIL_PORT
# 587

vercel env add EMAIL_USER_B64
# Paste base64 encoded email

vercel env add EMAIL_PASS_ENCRYPTED
# Paste encrypted password

vercel env add ADMIN_EMAIL
# piyoosh.rai@the-algo.com

vercel env add ADMIN_API_KEY
# Paste admin API key from setup.py
```

### 3.3: Deploy to Production

```bash
vercel --prod
```

Save the deployment URL (e.g., `https://alice-server.vercel.app`)

## Step 4: Deploy Dashboard to Vercel

### 4.1: Install Dependencies

```bash
cd ../alice-dashboard
npm install
```

### 4.2: Initialize Vercel Project

```bash
vercel
```

Follow prompts:
- Project name: `alice-dashboard`
- Framework: `Next.js`
- Build command: `npm run build`
- Output directory: `.next`

### 4.3: Set Environment Variables

```bash
vercel env add API_BASE_URL
# Paste your server URL (e.g., https://alice-server.vercel.app)

vercel env add ADMIN_API_KEY
# Paste same admin API key used for server
```

### 4.4: Deploy to Production

```bash
vercel --prod
```

Save the dashboard URL (e.g., `https://alice-dashboard.vercel.app`)

## Step 5: Verify Database Connection

Test the database connection:

```bash
# Connect to database
psql $DATABASE_URL

# Verify tables exist
\dt

# Should show: projects, developers, analyses, reports, bugs
```

## Step 6: Create First Project

### 6.1: Create Project via API

```bash
curl -X POST https://alice-server.vercel.app/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "admin_key": "YOUR_ADMIN_API_KEY"
  }'
```

Response:
```json
{
  "project_id": "uuid-here",
  "api_key": "alice_xxxxxxxxxxxxx",
  "name": "Test Project",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

**IMPORTANT:** Save the `api_key` - you cannot retrieve it later!

### 6.2: Verify Project Created

Check in database:
```sql
SELECT * FROM projects;
```

## Step 7: Install and Configure SDK

### 7.1: Install SDK

```bash
cd ../alice-sdk
npm install -g .
```

Or publish to NPM:
```bash
npm login
npm publish --access public
```

Then install:
```bash
npm install -g @the-algorithm/alice
```

### 7.2: Configure SDK

```bash
alice init
```

Enter:
- API key: (from Step 6.1)
- Server URL: Your server URL
- Your name: Your name
- Your email: Your email

## Step 8: Run Test Analysis

### 8.1: Test with Sample Project

```bash
cd ../test-project
alice analyze
```

Expected results:
- Quality score: 20-30
- Grade: D
- Deployment status: BLOCKED
- Multiple critical issues detected

### 8.2: Verify Emails Sent

Check both:
1. Developer email (technical report)
2. Management email (full assessment)

### 8.3: Check Dashboard

Visit: `https://alice-dashboard.vercel.app`

Verify:
- Analysis appears in dashboard
- Developer grade recorded
- Statistics updated

## Step 9: Production Readiness

### 9.1: Security Checklist

- [ ] All environment variables set as Vercel secrets
- [ ] Database uses SSL connection
- [ ] Email password encrypted
- [ ] Admin API key is secure (32+ characters)
- [ ] API keys are properly hashed in database
- [ ] HTTPS enabled on all endpoints

### 9.2: Monitoring Setup

- [ ] Vercel analytics enabled
- [ ] Database backups configured
- [ ] Email delivery monitoring
- [ ] Error logging configured

### 9.3: Documentation

- [ ] Team trained on using SDK
- [ ] Dashboard access documented
- [ ] Email report formats explained
- [ ] API key management process defined

## Step 10: Configure Git Hooks (Optional)

For automatic analysis on commits:

```bash
# In your project repository
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
alice analyze --silent || exit 1
EOF

chmod +x .git/hooks/pre-commit
```

## Troubleshooting

### Issue: "API key not found"

**Solution:** Verify API key is correct and exists in database:
```sql
SELECT name, created_at FROM projects WHERE api_key_hash = '...';
```

### Issue: "Database connection failed"

**Solution:** Check DATABASE_URL is correct:
```bash
psql $DATABASE_URL -c "SELECT version();"
```

### Issue: "Email not sending"

**Solution:**
1. Verify SMTP credentials are correct
2. Check EMAIL_USER_B64 is properly encoded
3. Verify EMAIL_PASS_ENCRYPTED can be decrypted
4. Enable "Less secure app access" for Gmail

### Issue: "Analysis fails with encoding error"

**Solution:** Ensure files are UTF-8 encoded:
```bash
file -i yourfile.js
```

### Issue: "Dashboard shows no data"

**Solution:**
1. Verify API_BASE_URL is correct
2. Check ADMIN_API_KEY matches server
3. Verify CORS is properly configured

## Maintenance

### Backup Database

```bash
# Daily backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Rotate Admin API Key

```bash
# Generate new key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Update in Vercel
vercel env rm ADMIN_API_KEY
vercel env add ADMIN_API_KEY

# Redeploy
vercel --prod
```

### Update SDK

```bash
cd alice-sdk
npm version patch
npm publish
```

### Monitor Usage

```bash
# Check analysis count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM analyses;"

# Check average score
psql $DATABASE_URL -c "SELECT AVG(quality_score) FROM analyses;"

# Check recent activity
psql $DATABASE_URL -c "SELECT * FROM analyses ORDER BY analyzed_at DESC LIMIT 10;"
```

## Production URLs

After deployment, you'll have:

- **Server API**: `https://alice-server.vercel.app`
- **Dashboard**: `https://alice-dashboard.vercel.app`
- **Database**: Your PostgreSQL URL
- **SDK**: `@the-algorithm/alice` on NPM

## Next Steps

1. Onboard team members with SDK
2. Create projects for each application
3. Set up CI/CD integration
4. Configure git hooks
5. Monitor dashboard regularly
6. Review developer assessments weekly

## Support

For deployment issues:
- Email: piyoosh.rai@the-algo.com
- Check logs: `vercel logs`
- Database issues: Check Vercel Postgres dashboard

---

Deployment checklist complete! ALICE is now production-ready.
