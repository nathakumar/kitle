import { useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";

interface Props {
  files: Record<string, string>;
}

type Tab = "preview" | "code";

export function PreviewPanel({ files }: Props) {
  const [tab, setTab] = useState<Tab>("preview");

  const hasFiles = Object.keys(files).length > 0;

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="inline-flex rounded-md border border-border bg-card p-0.5">
          <button
            onClick={() => setTab("preview")}
            className={
              "rounded px-3 py-1 text-xs font-medium transition-colors " +
              (tab === "preview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            Preview
          </button>
          <button
            onClick={() => setTab("code")}
            className={
              "rounded px-3 py-1 text-xs font-medium transition-colors " +
              (tab === "code"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            Code
          </button>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {hasFiles ? `${Object.keys(files).length} files` : "No project yet"}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        {!hasFiles ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h16.5v16.5H3.75z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-foreground">Live preview will appear here</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Send a prompt on the left to generate your first React + Vite project.
              </p>
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
          >
            <SandpackLayout style={{ height: "100%", border: "none", borderRadius: 0 }}>
              {tab === "preview" ? (
                <SandpackPreview style={{ height: "100%" }} showOpenInCodeSandbox={false} />
              ) : (
                <>
                  <SandpackFileExplorer style={{ height: "100%" }} />
                  <SandpackCodeEditor style={{ height: "100%" }} showTabs showLineNumbers />
                </>
              )}
            </SandpackLayout>
          </SandpackProvider>
        )}
      </div>
    </div>
  );
}
