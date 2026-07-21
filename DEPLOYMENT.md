# Deployment Guide

## Overview

This project is a TanStack Start SSR application with server-side rendering and WebContainer preview capabilities. It's configured for deployment on Vercel.

## Architecture

```
┌─────────────────────────────────────────┐
│         Vercel Edge Network             │
├─────────────────────────────────────────┤
│  Static Assets (dist/client)            │ ← Cache: 1 day
│  - HTML, CSS, JS bundles                │
│  - Favicon, public files                │
├─────────────────────────────────────────┤
│  Serverless Function (api/index.ts)     │ ← Node.js 20.x
│  - SSR rendering via dist/server        │
│  - API route handling                   │
│  - Memory: 3GB, Timeout: 60s             │
└─────────────────────────────────────────┘
```

## Build Process

The build generates two outputs:

1. **Client Build** (`dist/client/`)
   - Static HTML/CSS/JS bundles
   - Served directly from Vercel CDN
   - Cached with long TTL (1 day)
   - Includes favicon and public assets

2. **Server Build** (`dist/server/`)
   - Contains `server.js` (175 KB)
   - SSR-rendered HTML streaming
   - Server functions and API handlers
   - Dynamic content generation

## Vercel Configuration

### vercel.json

```json
{
  "buildCommand": "npm run build",           // Run this during build
  "outputDirectory": "dist/client",           // Static assets to serve
  "publicDirectory": "dist/client",           // Public files
  "framework": "other",                       // Custom framework
  "devCommand": "npm run dev",                // Local dev command
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x",                // Node.js runtime
      "memory": 3008,                         // 3GB RAM
      "maxDuration": 60                       // 60 second timeout
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",                      // All requests
      "destination": "/api"                   // → Serverless function
    }
  ]
}
```

### API Handler

The `api/index.ts` file:
- Imports the prebuilt SSR server from `dist/server/server.js`
- Handles all HTTP requests
- Streams responses for better performance
- Falls back to client HTML for SPA routes

## Deployment Steps

### 1. Push to GitHub
```bash
git push origin webcontainer-preview-system
```

### 2. Connect Repository to Vercel
- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Select the `nathakumar/kitle` repo
- Vercel auto-detects the configuration from `vercel.json`

### 3. Configure Environment Variables (if needed)
Set any environment variables in Vercel project settings:
- Navigate to Settings → Environment Variables
- Add variables like API keys, feature flags, etc.

### 4. Deploy
- Click "Deploy" button
- Wait for build to complete (usually 2-3 minutes)
- Vercel assigns a URL like `https://[project].vercel.app`

## Troubleshooting

### 404 NOT_FOUND Error
**Cause**: API handler not properly routing requests
**Solution**:
1. Verify `api/index.ts` exists
2. Check `vercel.json` has correct rewrites
3. Ensure build output is in `dist/client/`

### Build Failures
**Check**:
- `npm run build` passes locally
- No missing dependencies in `package.json`
- TypeScript compilation errors (run `npm run build` to see)

### Slow Initial Load
**Optimize**:
- The first request triggers SSR rendering (~100-200ms)
- Subsequent requests are faster with caching
- Consider using regional caching strategies

### Memory/Timeout Issues
**If serverless function times out**:
- Increase `maxDuration` in `vercel.json` (max 900s)
- Increase `memory` to 3008 MB (max available)
- Optimize server-side code

## Performance Metrics

Typical Vercel deployment performance:
- **Time to First Byte (TTFB)**: 50-200ms
- **First Contentful Paint (FCP)**: 300-600ms
- **Largest Contentful Paint (LCP)**: 800-1200ms
- **Total Build Time**: 2-3 minutes

## Production Best Practices

1. **Environment Variables**: Use `.env` files locally, set in Vercel dashboard in production
2. **Caching**: Static assets cache for 1 day
3. **Monitoring**: Enable Vercel Analytics for performance tracking
4. **Logs**: View real-time logs in Vercel dashboard under "Functions"
5. **Rollbacks**: Easy rollback to previous deployments

## Local Testing Before Deploy

```bash
# Build locally
npm run build

# Preview production build
npm run preview

# Test specific routes
curl http://localhost:4173/
curl http://localhost:4173/builder
curl http://localhost:4173/gallery
```

## GitHub Integration

The repository is connected to Vercel. On each push to `main` or PR branches:
- Automatic builds trigger
- Preview URLs generated for PRs
- Production deployment on merge to `main`

## Related Files

- `vite.config.ts` - Vite build configuration
- `package.json` - Build scripts and dependencies
- `src/` - Source code (React components, pages, functions)
- `dist/` - Build output (auto-generated)

## Support

For Vercel deployment issues:
- Check [Vercel Docs](https://vercel.com/docs)
- Review [TanStack Start Deployment](https://tanstack.com/router/latest/docs/framework/react/start)
- View Vercel project logs for detailed errors
