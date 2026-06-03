import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import JSZip from "jszip";
import { X, Rocket, ExternalLink, KeyRound, Loader2, LogIn } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  files: Record<string, string>;
}

const TOKEN_KEY = "netlify_pat";
const SITE_KEY = "netlify_site_id";

/**
 * Deploy the current Sandpack project to Netlify using the user's own
 * Personal Access Token. The token is stored only in the user's browser
 * (localStorage) — never sent to our backend.
 *
 * Netlify expects a fully-built static site. We ship the raw source ZIP
 * to a new site and let Netlify's build system (auto-detected Vite)
 * compile it.
 */
export function NetlifyDeployDialog({ open, onClose, files }: Props) {
  const [token, setToken] = useState("");
  const [siteName, setSiteName] = useState("");
  const [existingSiteId, setExistingSiteId] = useState("");
  const [busy, setBusy] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setToken(localStorage.getItem(TOKEN_KEY) ?? "");
    setExistingSiteId(localStorage.getItem(SITE_KEY) ?? "");
    setDeployUrl(null);
  }, [open]);

  const hasFiles = useMemo(() => Object.keys(files).length > 0, [files]);

  if (!open) return null;

  const handleDeploy = async () => {
    if (!token.trim()) {
      toast.error("Enter your Netlify personal access token");
      return;
    }
    if (!hasFiles) {
      toast.error("No files to deploy yet");
      return;
    }
    setBusy(true);
    try {
      localStorage.setItem(TOKEN_KEY, token.trim());

      // 1. Get or create the site
      let siteId = existingSiteId.trim();
      if (!siteId) {
        const createRes = await fetch("https://api.netlify.com/api/v1/sites", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(siteName.trim() ? { name: siteName.trim() } : {}),
        });
        if (!createRes.ok) {
          const txt = await createRes.text();
          throw new Error(`Could not create site: ${createRes.status} ${txt}`);
        }
        const site = await createRes.json();
        siteId = site.id;
        localStorage.setItem(SITE_KEY, siteId);
        setExistingSiteId(siteId);
      }

      // 2. Build a ZIP of the project files
      const zip = new JSZip();
      Object.entries(files).forEach(([path, content]) => {
        const clean = path.startsWith("/") ? path.slice(1) : path;
        zip.file(clean, content);
      });
      const blob = await zip.generateAsync({ type: "blob" });

      // 3. Upload as a new deploy (Netlify build will pick up Vite automatically)
      const deployRes = await fetch(
        `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/zip",
          },
          body: blob,
        },
      );
      if (!deployRes.ok) {
        const txt = await deployRes.text();
        throw new Error(`Deploy failed: ${deployRes.status} ${txt}`);
      }
      const deploy = await deployRes.json();
      const url = deploy.deploy_ssl_url || deploy.deploy_url || deploy.ssl_url || deploy.url;
      setDeployUrl(url);
      toast.success("Deployed to Netlify");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Deploy failed");
    } finally {
      setBusy(false);
    }
  };

  const handleOAuthConnect = () => {
    const popup = window.open(
      "/api/public/netlify/start",
      "netlify-oauth",
      "width=620,height=720",
    );
    if (!popup) {
      toast.error("Popup blocked. Allow popups and try again.");
      return;
    }
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.source !== "netlify-oauth") return;
      window.removeEventListener("message", onMessage);
      if (data.ok && data.access_token) {
        setToken(data.access_token);
        localStorage.setItem(TOKEN_KEY, data.access_token);
        toast.success("Connected to Netlify");
      } else {
        toast.error(`Netlify sign-in failed: ${data.error ?? "unknown"}`);
      }
    };
    window.addEventListener("message", onMessage);
  };

  const dialog = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/80 p-4 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, #00C7B7, #0E7C7B)" }}
            >
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Deploy to Netlify</h2>
              <p className="text-xs text-muted-foreground">
                Ship this project to your own Netlify account.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <KeyRound className="h-3 w-3" />
                Personal access token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="nfp_xxx..."
                autoComplete="off"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <a
                href="https://app.netlify.com/user/applications#personal-access-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                Create a token <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Site name (optional, new site only)
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="my-awesome-app"
                disabled={!!existingSiteId}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
              />
            </div>

            {existingSiteId && (
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs">
                <span className="truncate text-muted-foreground">
                  Re-deploying to site <code className="text-foreground">{existingSiteId.slice(0, 8)}…</code>
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem(SITE_KEY);
                    setExistingSiteId("");
                  }}
                  className="ml-2 text-foreground underline-offset-2 hover:underline"
                >
                  New site
                </button>
              </div>
            )}

            {deployUrl && (
              <a
                href={deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-500/20"
              >
                <span className="truncate">{deployUrl}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            )}

            <button
              onClick={handleDeploy}
              disabled={busy || !hasFiles}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Deploying…
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" /> {existingSiteId ? "Redeploy" : "Deploy"}
                </>
              )}
            </button>

            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Your token is stored only in this browser (localStorage) and sent directly to
              api.netlify.com. We never see it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(dialog, document.body);
}
