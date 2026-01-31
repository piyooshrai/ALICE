# Fix Vercel Deployment

## Configure Vercel Settings

Go to: **Vercel Dashboard → Your Project → Settings → Build & Development**

### 1. Root Directory
Set to: `alice-dashboard`
(You already did this ✓)

### 2. Framework Preset
**IMPORTANT**: Set to `Next.js`
(Not "Other" or anything else)

### 3. Build Settings
Leave these EMPTY - Vercel auto-detects for Next.js:
- Build Command: (empty)
- Output Directory: (empty)
- Install Command: (empty)

Vercel will automatically use:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 4. Save and Redeploy

1. Click **Save** at the bottom
2. Go to **Deployments** tab
3. Click **Redeploy** on latest deployment

## Why This Fixes It

Next.js 14 outputs to `.next/` directory, not `public/`. By setting Framework Preset to "Next.js", Vercel knows this and configures everything correctly.

The "public directory" error means Vercel was treating your app as a static site instead of Next.js.

## After Deployment

All routes should work:
- /
- /developers
- /analytics
- /projects
