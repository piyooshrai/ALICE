# Vercel Deployment Guide for ALICE Dashboard

## Quick Redeploy

Your code is committed but Vercel needs to redeploy. Here are your options:

### Option 1: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Find your `alice-dashboard` project
3. Click on the project
4. Go to "Deployments" tab
5. Click "Redeploy" on the latest deployment
6. OR click "Deploy" > "Redeploy" from the overflow menu

### Option 2: Vercel CLI

```bash
cd alice-dashboard

# If you haven't installed Vercel CLI:
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 3: Push Trigger (If GitHub Integration Enabled)

If you have Vercel connected to your GitHub repo:

```bash
# Make a small change to trigger deployment
cd alice-dashboard
echo "# Trigger deploy" >> README.md
git add README.md
git commit -m "Trigger Vercel redeploy"
git push origin claude/build-alice-service-4u2Ox
```

Vercel should auto-deploy within 1-2 minutes.

## Verify Deployment

After redeploying, check these URLs work:

- `https://your-app.vercel.app/` - Main dashboard
- `https://your-app.vercel.app/developers` - Developers page
- `https://your-app.vercel.app/analytics` - Analytics placeholder
- `https://your-app.vercel.app/projects` - Projects placeholder

All should return 200 OK (not 404).

## What Was Fixed

The latest commits fixed:
- ✅ Google Fonts loading (now via CDN)
- ✅ Missing /analytics route (added page.tsx)
- ✅ Missing /projects route (added page.tsx)
- ✅ Build configuration (simplified for deployment)

## If Still Getting 404

1. Check Vercel deployment logs for errors
2. Ensure the deployment used the latest commit (ae0d7b6)
3. Check that the build succeeded
4. Verify all routes exist in the build output

## Local Testing

Before deploying, you can test locally:

```bash
cd alice-dashboard
npm run build    # Should complete successfully
npm run start    # Test production build locally
```

Then visit http://localhost:3000 to verify all routes work.
