# StackBlitz WebContainer Preview System

This application uses **StackBlitz WebContainer** to provide a client-side, in-browser development environment for code generation and live previews.

## Architecture

### Components

- **PreviewPanel** (`src/components/builder/PreviewPanel.tsx`): Main UI component that embeds and manages the WebContainer
- **WebContainer Utilities** (`src/lib/webcontainer.ts`): Low-level utilities for lifecycle management, browser detection, and error handling
- **Project Generation** (`src/lib/generate.functions.ts`): Server-side code generation that produces WebContainer-compatible projects

### How It Works

1. **Code Generation**: User sends a prompt → LLM generates React + TypeScript + Vite project
2. **File Preparation**: Generated files are normalized and enhanced with default configs (package.json, vite.config.ts, tsconfig.json)
3. **Embedding**: Files are embedded into a StackBlitz iframe using `@stackblitz/sdk`
4. **Hot Updates**: File changes are applied via `vm.applyFsDiff()` for warm updates without full reload
5. **Preview**: The dev server runs inside the WebContainer and renders in the iframe

## Supported Browsers

WebContainer is supported in:
- Chrome/Chromium 90+
- Edge 90+
- Firefox 96+
- Safari 16.4+
- Opera and other Chromium-based browsers

**Not supported:**
- Internet Explorer (all versions)
- Very old browser versions
- WebView in mobile apps (may work depending on engine)

## Browser Compatibility Checks

The system performs runtime checks:

```typescript
import { isBrowserSupported, areThirdPartyCookiesAllowed } from "@/lib/webcontainer";

const supported = isBrowserSupported();
const cookiesAllowed = await areThirdPartyCookiesAllowed();
```

## Error Handling

When WebContainer fails to initialize, the system:

1. **Detects the issue** using browser detection + storage API checks
2. **Provides specific error messages** telling users exactly what's wrong
3. **Offers alternatives**: Users can still download the project as ZIP and run it locally

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "WebContainer not supported" | Old browser | Update browser to Chrome 90+, Edge 90+, Firefox 96+, or Safari 16.4+ |
| "Third-party cookies blocked" | Cookie restrictions | Disable cookie blocking for this site |
| "Failed to create sandbox" | Private/Incognito mode | Use normal browsing mode |
| "JavaScript disabled" | JS disabled in browser | Enable JavaScript |
| Timeout/stuck loading | Network issue | Refresh and try again |

## Project Structure

Generated projects include:

```
project/
├── package.json          # npm dependencies + build scripts
├── vite.config.ts        # Vite configuration (React plugin)
├── tsconfig.json         # TypeScript configuration
├── index.html            # Entry HTML with #root div
├── index.tsx             # React app entry point
├── App.tsx               # Main component
├── styles.css            # Global styles
├── components/           # Reusable components
├── pages/                # Route components (if multi-page)
├── lib/                  # Utilities
├── hooks/                # Custom hooks
├── types.ts              # TypeScript types
└── data/                 # Seed data / constants
```

## Build Scripts

The generated projects include these npm scripts:

```bash
npm run dev      # Start development server (port 5173)
npm run build    # Type-check + create optimized build
npm run preview  # Preview the built app
npm start        # Alias for dev
```

All scripts use `--host 0.0.0.0` to ensure the server is accessible from the iframe.

## File Changes & Hot Updates

When you edit code in the chat, the system:

1. **Computes a diff**: Compares new files to last mounted files
2. **Applies changes**: Uses `vm.applyFsDiff({ create: {...}, destroy: [...] })`
3. **Hot reload**: The dev server picks up changes and reloads the preview
4. **No full reload**: Application state is preserved during updates

This is much faster than re-embedding the entire project.

## Performance Considerations

- **Initial load**: 3-10 seconds (depends on browser speed + network)
- **File updates**: < 1 second (warm updates)
- **Large projects**: May slow down if > 50 files or > 5MB total size
- **Memory**: Each WebContainer instance uses 100-300MB RAM

## Deployment

Bundled projects can be deployed to:

- **Netlify** (via button in UI)
- **Vercel** (via button in UI)
- **GitHub Pages** (after downloading ZIP)
- **Any static host** (build → upload `dist/` folder)

The `bundleProject.ts` utility can also create a static-only version for deployment to CDNs.

## Development

### Testing WebContainer Locally

```bash
npm install
npm run dev

# Navigate to /builder
# Try generating a new project
```

### Debugging WebContainer Issues

Enable verbose logging:

```typescript
// In PreviewPanel.tsx, look for console.log calls
// Add [v0] prefix to identify our logs:
console.log("[v0] WebContainer state:", sbState);
console.log("[v0] Error details:", sbError);
```

### Browser DevTools

1. Open DevTools in the main window
2. The WebContainer iframe logs appear in the console
3. Network tab shows iframe creation and resource loading
4. Application tab shows iframe storage/cookies

## Fallback Modes

If WebContainer is not supported, the system falls back to:

- **Non-website modes**: Text-based output (data analysis, education, content, chat)
- **Download ZIP**: Users can download the project and run locally
- **Links**: GitHub, deploy buttons still work

## Security

- Files never leave the browser (except when explicitly downloading)
- WebContainer runs in a sandboxed iframe
- No server-side code execution for generated projects
- CORS restrictions apply for external APIs in the preview

## References

- [StackBlitz SDK Docs](https://developer.stackblitz.com/)
- [WebContainer FAQ](https://developer.stackblitz.com/docs/platform/webcontainers/understanding-webcontainers)
- [Browser Support Matrix](https://developer.stackblitz.com/docs/platform/webcontainers/browser-support)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
