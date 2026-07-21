# Troubleshooting Guide

## Deployment Errors

### 404: NOT_FOUND (Code: NOT_FOUND)

**Symptoms**:
- Deployment succeeds but accessing the app returns 404
- Shows error: `Code: NOT_FOUND, ID: bom1::...`

**Causes**:
1. API handler not properly configured
2. Rewrites not working correctly
3. Server files not deployed

**Solutions**:

✓ **Check vercel.json exists and is valid**
```bash
cat vercel.json  # Should show build/output/function config
```

✓ **Verify api/index.ts exists**
```bash
ls -la api/index.ts  # Should exist
```

✓ **Ensure dist/server/server.js exists**
```bash
npm run build
ls -la dist/server/server.js
```

✓ **Check Vercel function logs**
- Go to Vercel dashboard → Functions tab
- View logs for `api` function
- Look for import errors or crashes

✓ **Test locally first**
```bash
npm run build
npm run preview
# Visit http://localhost:4173/
```

---

## Build Issues

### Build Fails with TypeScript Errors

**Solution**:
```bash
npm run build 2>&1 | tail -50
```
Check the error output and fix issues in source files.

### Missing Dependencies

**Error**: `Cannot find module '@package/name'`

**Solution**:
```bash
npm install
npm run build
```

---

## Preview Issues

### WebContainer Not Loading

**Check browser console**:
- Open DevTools (F12)
- Look for errors in Console tab
- See WEBCONTAINER.md for compatibility

**Verify third-party cookies**:
1. Chrome/Edge: Settings → Privacy → Cookies → Allow third-party cookies
2. Firefox: Privacy → Enhanced Tracking Protection → Allow for this site
3. Safari: Privacy → Block all cookies → Off

### Preview Shows Blank Page

**Solution**:
1. Check browser compatibility (Chrome 90+, Edge 90+, Firefox 96+)
2. Disable browser extensions
3. Try incognito/private window
4. See WEBCONTAINER.md for detailed troubleshooting

---

## Performance Issues

### Slow Initial Load

**Expected**: First request is slower due to SSR
- Normal TTFB: 50-200ms
- First render: 300-600ms

**If slower**:
1. Check Vercel dashboard for function duration
2. Look for slow server functions
3. Optimize database queries

### High Memory Usage

**If serverless function crashes**:
1. Increase memory in vercel.json (already set to 3008 MB)
2. Check for memory leaks in code
3. Review function logs

---

## Local Development Issues

### Dev Server Won't Start

**Error**: `Port 5000 already in use`

**Solution**:
```bash
# Kill process using port 5000
pkill -f "vite dev"
npm run dev
```

### HMR Not Working

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Environment Variables

### Missing Environment Variable

**Error**: `Error: Variable X is not defined`

**Solution**:
1. Add to `.env.local` for local development:
   ```
   VARIABLE_NAME=value
   ```
2. Add to Vercel dashboard for production:
   - Project Settings → Environment Variables
   - Add variable and redeploy

---

## Git and Repository Issues

### Cannot Push to Repository

**Solution**:
```bash
git status  # Check what changed
git add .
git commit -m "Your message"
git push origin webcontainer-preview-system
```

### Branch Not Deployed

**Ensure**:
1. Branch pushed to GitHub
2. Vercel project connected to GitHub repo
3. Branch has proper vercel.json

---

## Common Commands Reference

```bash
# Development
npm run dev                    # Start dev server (http://localhost:5000)
npm run lint                  # Check code quality
npm run format               # Format code with Prettier

# Building
npm run build                # Build for production
npm run build:dev           # Build in dev mode
npm run preview             # Preview production build locally

# Deployment
npm run build               # Build before pushing
git push origin branch-name # Push to GitHub
# Then deploy via Vercel dashboard
```

---

## Quick Fix Checklist

When deployment fails:

- [ ] Run `npm run build` locally - does it pass?
- [ ] Check `vercel.json` exists and is valid JSON
- [ ] Verify `api/index.ts` exists
- [ ] Confirm `dist/server/server.js` is built
- [ ] Test with `npm run preview`
- [ ] Check Vercel function logs
- [ ] Verify git branch is pushed
- [ ] Ensure `.gitignore` doesn't exclude needed files

---

## Still Having Issues?

1. **View detailed logs**:
   - Vercel Dashboard → Deployments → Select deployment → Logs
   - Look for function errors or build failures

2. **Test locally**:
   ```bash
   npm run build && npm run preview
   ```

3. **Check repository state**:
   ```bash
   git status
   git log -1
   ```

4. **Vercel documentation**: https://vercel.com/docs
5. **TanStack Start docs**: https://tanstack.com/router/latest/docs/framework/react/start
