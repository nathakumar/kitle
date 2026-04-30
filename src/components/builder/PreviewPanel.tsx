import { useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { Code2, Eye, Sparkles } from "lucide-react";

interface Props {
  files: Record<string, string>;
}

type Tab = "preview" | "code";

export function PreviewPanel({ files }: Props) {
  const [tab, setTab] = useState<Tab>("preview");

  const hasFiles = Object.keys(files).length > 0;

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: "var(--builder-surface-2)" }}
    >
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
        <div className="flex items-center gap-2">
          {/* macOS-style traffic lights */}
          <div className="hidden items-center gap-1.5 pl-1 pr-2 sm:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="inline-flex rounded-lg border border-border/60 bg-background/40 p-0.5">
            <button
              onClick={() => setTab("preview")}
              className={
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all " +
                (tab === "preview"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <Eye className="h-3 w-3" /> Preview
            </button>
            <button
              onClick={() => setTab("code")}
              className={
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all " +
                (tab === "code"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <Code2 className="h-3 w-3" /> Code
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-md border border-border/60 bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
            {hasFiles ? `${Object.keys(files).length} files` : "Idle"}
          </span>
        </div>
      </div>

      {/* Surface */}
      <div className="relative flex-1 overflow-hidden p-2 sm:p-3">
        <div
          className="relative h-full w-full overflow-hidden rounded-xl border border-border/60"
          style={{ boxShadow: "var(--shadow-soft)", background: "var(--builder-surface)" }}
        >
          {!hasFiles ? (
            <div className="relative flex h-full items-center justify-center p-8">
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "var(--gradient-glow)" }}
              />
              <div className="relative max-w-sm text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{ background: "var(--gradient-builder)", boxShadow: "var(--shadow-glow)" }}
                >
                  <Sparkles className="h-6 w-6" strokeWidth={2} />
                </div>
                <h2 className="builder-gradient-text text-base font-semibold">
                  Your live preview will appear here
                </h2>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Send a prompt on the left to scaffold a React + Vite project in seconds.
                </p>
                <div className="mt-5 flex justify-center gap-1">
                  <span className="builder-dot h-1.5 w-1.5 rounded-full bg-foreground/40" style={{ animationDelay: "0ms" }} />
                  <span className="builder-dot h-1.5 w-1.5 rounded-full bg-foreground/40" style={{ animationDelay: "150ms" }} />
                  <span className="builder-dot h-1.5 w-1.5 rounded-full bg-foreground/40" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          ) : (
            <SandpackProvider
              key={Object.keys(files).join("|")}
              template="react-ts"
              files={files}
              theme="dark"
              options={{
                recompileMode: "delayed",
                recompileDelay: 300,
              }}
              customSetup={{
                dependencies: {
                  react: "^18.2.0",
                  "react-dom": "^18.2.0",
                },
              }}
              style={{ height: "100%" }}
            >
              <SandpackLayout
                style={{
                  height: "100%",
                  width: "100%",
                  border: "none",
                  borderRadius: 0,
                  display: "flex",
                  background: "transparent",
                }}
              >
                {tab === "preview" ? (
                  <SandpackPreview
                    style={{ height: "100%", flex: 1, minWidth: 0 }}
                    showOpenInCodeSandbox={false}
                  />
                ) : (
                  <div style={{ display: "flex", height: "100%", width: "100%", minWidth: 0 }}>
                    <SandpackFileExplorer
                      style={{
                        height: "100%",
                        flexShrink: 0,
                        width: 220,
                        minWidth: 180,
                        borderRight: "1px solid var(--builder-elevated)",
                        overflowY: "auto",
                      }}
                      autoHiddenFiles
                    />
                    <SandpackCodeEditor
                      style={{ height: "100%", flex: 1, minWidth: 0 }}
                      showTabs
                      showLineNumbers
                      showInlineErrors
                      wrapContent
                      closableTabs
                    />
                  </div>
                )}
              </SandpackLayout>
            </SandpackProvider>
          )}
        </div>
      </div>
    </div>
  );
}
