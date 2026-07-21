/**
 * WebContainer utilities for enhanced StackBlitz integration
 * Provides utilities for proper VM lifecycle management, error handling, and diagnostics
 */

import sdk, { type VM } from "@stackblitz/sdk";

export interface WebContainerConfig {
  files: Record<string, string>;
  openFile?: string;
  onBuildStart?: () => void;
  onBuildComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Check if the browser supports WebContainer
 * WebContainer is supported in: Chrome 90+, Edge 90+, Firefox 96+, Safari 16.4+
 */
export function isBrowserSupported(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent;
  
  // Check for Chromium-based browsers (Chrome, Edge, Opera)
  if (/Chrome|Chromium|CriOS|Edg|OPR/.test(ua)) return true;
  
  // Check for Firefox
  if (/Firefox/.test(ua)) {
    const match = ua.match(/Firefox\/(\d+)/);
    if (match) return parseInt(match[1]) >= 96;
  }
  
  // Check for Safari 16.4+
  if (/Safari|AppleWebKit/.test(ua)) {
    const match = ua.match(/Version\/(\d+)\.(\d+)/);
    if (match) {
      const major = parseInt(match[1]);
      const minor = parseInt(match[2]);
      return major > 16 || (major === 16 && minor >= 4);
    }
  }
  
  return true; // Assume supported for unknown browsers
}

/**
 * Check if third-party cookies are allowed (required for WebContainer iframe communication)
 */
export async function areThirdPartyCookiesAllowed(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    // Try to set a cookie via storage API
    const testKey = "__webcontainer_test__";
    localStorage.setItem(testKey, "test");
    const canWrite = localStorage.getItem(testKey) === "test";
    localStorage.removeItem(testKey);
    return canWrite;
  } catch {
    return false;
  }
}

/**
 * Diagnose WebContainer compatibility issues
 */
export async function diagnoseWebContainerSupport(): Promise<{
  supported: boolean;
  browserSupported: boolean;
  storageAvailable: boolean;
  isPrivateWindow: boolean;
  jsEnabled: boolean;
}> {
  return {
    supported: isBrowserSupported(),
    browserSupported: isBrowserSupported(),
    storageAvailable: await areThirdPartyCookiesAllowed(),
    isPrivateWindow: !localStorage,
    jsEnabled: true, // If we're here, JS is enabled
  };
}

/**
 * Create a minimal WebContainer-compatible project with default configs
 */
export function createDefaultPackageJson(): Record<string, string> {
  return {
    package: JSON.stringify(
      {
        name: "vite-react-app",
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite --host 0.0.0.0 --port 5173",
          build: "tsc --noEmit && vite build",
          preview: "vite preview --host 0.0.0.0",
          start: "vite --host 0.0.0.0",
        },
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1",
          "lucide-react": "^0.395.0",
        },
        devDependencies: {
          "@types/react": "^18.3.3",
          "@types/react-dom": "^18.3.0",
          "@vitejs/plugin-react": "^4.3.1",
          typescript: "^5.2.2",
          vite: "^5.3.1",
        },
      },
      null,
      2,
    ),
    vite: JSON.stringify(
      {
        plugins: ["react"],
        server: {
          host: "0.0.0.0",
          port: 5173,
        },
      },
      null,
      2,
    ),
    tsconfig: JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          useDefineForClassFields: true,
          lib: ["DOM", "DOM.Iterable", "ES2020"],
          module: "ESNext",
          skipLibCheck: true,
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx",
          strict: true,
          noUnusedLocals: false,
          noUnusedParameters: false,
          noFallthroughCasesInSwitch: true,
        },
        include: ["."],
      },
      null,
      2,
    ),
  };
}

/**
 * Handle WebContainer-specific errors with helpful messages
 */
export function translateWebContainerError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("WebContainer")) return `WebContainer initialization error: ${message}`;
  if (message.includes("permission")) return "Browser permissions denied. Check if cookies are blocked.";
  if (message.includes("sandbox") || message.includes("iframe"))
    return "Unable to create sandbox environment. Third-party cookies may be blocked.";
  if (message.includes("timeout")) return "WebContainer took too long to initialize. Please refresh and try again.";

  return `Unexpected error: ${message}`;
}

/**
 * Safely embed a project with error handling and diagnostics
 */
export async function safeEmbedProject(
  container: HTMLElement,
  projectConfig: Parameters<typeof sdk.embedProject>[1],
  embedOptions: Parameters<typeof sdk.embedProject>[2],
): Promise<{ vm: VM | null; error: string | null }> {
  try {
    // Quick browser support check
    if (!isBrowserSupported()) {
      return {
        vm: null,
        error: "Your browser does not support WebContainer. Please use Chrome 90+, Edge 90+, Firefox 96+, or Safari 16.4+.",
      };
    }

    console.log("[WebContainer] Starting embed with config:", { title: projectConfig.title });

    const vm = await sdk.embedProject(container, projectConfig, embedOptions);

    console.log("[WebContainer] Successfully embedded project");
    return { vm, error: null };
  } catch (err) {
    const friendlyError = translateWebContainerError(err);
    console.error("[WebContainer] Embed failed:", err);
    return { vm: null, error: friendlyError };
  }
}
