# Vercel Deployment Fix - Complete Guide

## Problem Summary
The previous deployment was failing with a 404 error because:
- The build wasn't being properly triggered
- No start command was configured for Vercel to run
- The TanStack Start server wasn't being invoked

## Solution Implemented

### 1. Simplified vercel.json
```json
{
  "buildCommand": "npm run build",
  "startCommand": "npm start",
  "installCommand": "npm install",
  "framework": "other"
}
```

This minimal configuration tells Vercel to:
- Run `npm run build` to create dist/server/server.js and dist/client assets
- Run `npm start` to start the production server
- Use Node package manager to install dependencies

### 2. Created server.mjs
A new entry point that:
- Imports the built TanStack Start server from `dist/server/server.js`
- Listens on the PORT environment variable (default 3000)
- Handles graceful shutdown on SIGTERM/SIGINT signals
- Runs as a standard Node.js process

### 3. Updated package.json
Added `"start": "node server.mjs"` to scripts section, which Vercel calls when deploying.

## How It Works

1. **Build Phase (npm run build)**
   - Vite compiles TypeScript/React code
   - TanStack Start plugin generates:
     - `dist/client/` - Static assets (HTML, CSS, JS)
     - `dist/server/server.js` - Node.js SSR server

2. **Deploy Phase (npm start)**
   - Vercel runs `node server.mjs`
   - server.mjs imports and starts the built server
   - Server listens on PORT (automatically set by Vercel)
   - Requests are routed to the running Node.js process

## Deployment Steps

### From Vercel Dashboard:
1. Go to your Vercel project
2. Redeploy the current branch
3. Monitor the build and deployment logs
4. Once complete, your app should be live at the deployment URL

### From CLI:
```bash
# Push to GitHub (Vercel auto-deploys on push)
git push origin webcontainer-preview-system

# Or manually redeploy
vercel redeploy --prod
```

## Verification

After deployment, you should see:
- Build logs showing "✓ built in X.XXs"
- Deployment completion message
- Your app loads without 404 errors
- All pages and API routes work

## Troubleshooting

### If deployment still fails:
1. Check Vercel logs: `vercel logs <url> --follow`
2. Ensure all files are committed: `git status`
3. Check build output: `npm run build` runs locally
4. Verify server starts: `npm start` runs without errors

### Common Issues:
- **Module not found errors**: Ensure all dependencies are in package.json
- **Port already in use**: Vercel assigns the PORT variable
- **Timeout errors**: Increase maxDuration in Function settings if needed

## Performance Notes

- Static assets are cached at CDN edge
- Server runs in Node.js 20.x runtime on Vercel
- Memory allocated: default (can be customized)
- Cold starts: ~1-2 seconds on first request

## Environment Variables

If your app uses environment variables, add them in:
1. Vercel Dashboard → Project Settings → Environment Variables
2. Or use `.env.production.local` (not committed)

## Next Steps

1. Commit and push changes
2. Vercel auto-redeploys on push
3. Monitor the deployment
4. Test the live URL
5. Share the deployment link

---

**Last Updated**: July 21, 2026  
**Status**: Ready for deployment
