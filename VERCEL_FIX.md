# Fix Vercel 404 Error

## The Problem

Your repo is a monorepo with multiple projects:
```
ALICE/
├── alice-dashboard/  ← Next.js app (should be deployed)
├── alice-server/     ← Python backend
└── alice-sdk/        ← CLI tool
```

**Vercel is looking for Next.js at the repo root, but it's in `alice-dashboard/`**

## The Fix - Configure Root Directory in Vercel

### Step 1: Go to Vercel Project Settings

1. Go to https://vercel.com/dashboard
2. Click on your ALICE dashboard project
3. Click **Settings** (top navigation)

### Step 2: Set Root Directory

1. Scroll to **Root Directory** section
2. Click **Edit**
3. Enter: `alice-dashboard`
4. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Wait for build to complete

## That's It

Vercel will now:
- Look for package.json in `alice-dashboard/`
- Find the Next.js app
- Build all routes correctly
- No more 404 errors

## Verify It Works

After redeployment, these should all work:
- https://your-app.vercel.app/
- https://your-app.vercel.app/developers
- https://your-app.vercel.app/analytics
- https://your-app.vercel.app/projects

All routes will return 200 OK with the dashboard UI.
