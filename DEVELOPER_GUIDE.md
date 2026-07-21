# WebContainer Preview System - Developer Guide

## Quick Start

### Understanding the Architecture

```
User Input
    ↓
generateProject() [server]
    ↓
Files returned to client
    ↓
PreviewPanel Component
    ├─ normalizeFiles()
    ├─ withDefaultConfig()
    └─ safeEmbedProject() → StackBlitz SDK
        ↓
    WebContainer VM
    ├─ npm install
    ├─ npm run dev
    └─ Vite dev server → iframe preview
```

### Key Files

| File | Purpose |
|------|---------|
| `src/components/builder/PreviewPanel.tsx` | Main preview UI component |
| `src/lib/webcontainer.ts` | WebContainer utilities & diagnostics |
| `src/lib/generate.functions.ts` | Server-side code generation |
| `WEBCONTAINER.md` | User-facing documentation |

## State Machine

```
idle
  ↓
[user sends prompt]
  ↓
embedding
  ├─ sdk.embedProject() called
  ├─ Files mounted
  └─ VM initializing
  ↓
building
  ├─ npm install running
  ├─ vite dev starting
  └─ Type checking
  ↓
ready
  ├─ Dev server listening
  ├─ Preview iframe showing
  └─ Can accept file updates
  ↓
[if error at any stage]
  ↓
error
  └─ safeEmbedProject returns { vm: null, error: "..." }
```

## Common Tasks

### Adding a New State

```typescript
// 1. Update state union
const [sbState, setSbState] = useState<"idle" | "embedding" | "building" | "ready" | "error" | "deploying">("idle");

// 2. Add case to getLoaderLabel()
if (sbState === "deploying")
  return "Deploying to Vercel...";

// 3. Transition to new state where appropriate
setSbState("deploying");
```

### Debugging WebContainer Issues

```typescript
// 1. Check browser support
import { isBrowserSupported, diagnoseWebContainerSupport } from "@/lib/webcontainer";

const diagnosis = await diagnoseWebContainerSupport();
console.log("[WebContainer] Diagnosis:", diagnosis);

// 2. Monitor state changes
useEffect(() => {
  console.log("[v0] WebContainer state:", sbState);
}, [sbState]);

// 3. Check error details
useEffect(() => {
  if (sbError) {
    console.log("[v0] WebContainer error:", sbError);
  }
}, [sbError]);
```

### Testing Terminal Output

```typescript
// In PreviewPanel, after embedProject succeeds:
if (vm) {
  // Listen for terminal output (SDK may not expose this fully)
  // For now, we track state and offer UI toggle
  setBuildOutput([
    "npm install...",
    "✓ Installed 692 packages",
    "vite v7.3.6 ready in 1172 ms",
  ]);
}
```

### Hot Updates to Running Project

```typescript
// Called when files change
if (vmRef.current) {
  const lastFiles = mountedFilesRef.current;
  const create: Record<string, string> = {};
  const destroy: string[] = [];

  // Calculate diff
  for (const [path, content] of Object.entries(newFiles)) {
    if (lastFiles[path] !== content) {
      create[path] = content;
    }
  }

  // Apply updates
  await vmRef.current.applyFsDiff({ create, destroy });
}
```

## Error Handling Best Practices

### Good ❌ vs Bad ✓

```typescript
// ❌ Bad: Silent failure
try {
  const vm = await sdk.embedProject(...);
} catch (err) {
  console.error(err);
}

// ✓ Good: User-friendly error
const { vm, error } = await safeEmbedProject(...);
if (error) {
  setSbError(error);
  setSbState("error");
}
```

```typescript
// ❌ Bad: Generic message
"Preview failed"

// ✓ Good: Specific, actionable
"Your browser does not support WebContainer. Please use Chrome 90+, Edge 90+, Firefox 96+, or Safari 16.4+."
```

## Performance Tips

1. **File Size**: Keep total project < 5MB for snappy HMR
2. **Module Count**: Aim for < 50 files for faster `applyFsDiff`
3. **Dependencies**: Only include necessary packages in package.json
4. **Lazy Loading**: Use dynamic imports for heavy dependencies
5. **Caching**: Leverage browser caching for node_modules

## Browser DevTools Tips

### Inspect the iframe

```javascript
// In browser console:
document.querySelector("iframe")
  .contentWindow.navigator.userAgent
```

### Monitor network activity

1. DevTools → Network tab
2. Look for iframe creation requests
3. Check for CORS errors
4. Monitor `*.stackblitz.com` requests

### View iframe console

1. Right-click iframe → Inspect
2. In DevTools, select iframe window
3. Switch to Console tab
4. See dev server logs

## Extending the System

### Adding OAuth/Custom Auth

```typescript
// In PreviewPanel, before embedding:
const authToken = await getAuthToken();
const files = {
  ...project.files,
  ".env.local": `VITE_AUTH_TOKEN=${authToken}`,
};

// Then embed as usual
```

### Adding Custom Build Steps

```typescript
// Modify package.json generation:
{
  "scripts": {
    "predev": "custom-script",
    "dev": "vite --host 0.0.0.0",
  }
}
```

### Adding Language Support

StackBlitz WebContainer supports:
- Node.js (default)
- TypeScript
- Python (experimental)
- Go (experimental)

To switch:
```typescript
template: "node" | "typescript" | "python" | "go"
```

## Testing Checklist

- [ ] Generate a simple React app
- [ ] Verify preview loads
- [ ] Edit a file and verify hot-reload
- [ ] Add a new file
- [ ] Delete a file
- [ ] Check error handling (block cookies, use Safari, etc.)
- [ ] Test on mobile viewport
- [ ] Test file download
- [ ] Test Netlify deploy button
- [ ] Test Vercel deploy button

## Debugging Workflow

1. **App won't load**: Check browser DevTools console for errors
2. **Preview blank**: Check iframe content in DevTools
3. **Changes not reflecting**: Check `applyFsDiff` call and error handling
4. **Slow preview**: Check file count and sizes
5. **Deployment fails**: Check `.env` and build scripts in generated project

## Resources

- StackBlitz SDK: https://developer.stackblitz.com/docs/api/javascript-sdk
- WebContainer Docs: https://developer.stackblitz.com/docs/platform/webcontainers
- Vite HMR: https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server
- React Fast Refresh: https://github.com/pmmmwh/react-refresh

## Common Issues & Solutions

### "Failed to fetch dynamically imported module"
- **Cause**: Build configuration or module resolution issue
- **Solution**: Check tsconfig.json and vite.config.ts

### "WebContainer timed out"
- **Cause**: Slow network or large dependencies
- **Solution**: Reload page, check network, reduce dependencies

### "Preview shows blank white screen"
- **Cause**: React didn't mount or app crashed
- **Solution**: Check browser console for errors, verify index.html

### "Terminal not showing"
- **Cause**: Terminal toggle only shows when ready
- **Solution**: Wait for "ready" state or check sbState

## Contributing

When adding features to WebContainer system:

1. **Update state machine** if adding new states
2. **Add error cases** using `safeEmbedProject`
3. **Document changes** in WEBCONTAINER.md
4. **Test in multiple browsers**
5. **Check performance** with large projects
6. **Update this guide** if behavior changes
