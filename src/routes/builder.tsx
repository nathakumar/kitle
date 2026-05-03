import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatPanel, type ChatMessage } from "@/components/builder/ChatPanel";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import { generateProject } from "@/server/generate.functions";

type BuilderSearch = { prompt?: string; saved?: string };
type MobileView = "chat" | "preview";

export const Route = createFileRoute("/builder")({
  validateSearch: (search: Record<string, unknown>): BuilderSearch => ({
    prompt: typeof search.prompt === "string" ? search.prompt : undefined,
    saved: typeof search.saved === "string" ? search.saved : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Builder — AI App Builder" },
      { name: "description", content: "Generate and iterate on a React + Vite app with live preview." },
    ],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const { prompt, saved } = Route.useSearch();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("chat");
  const initialFired = useRef(false);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const result = await generateProject({
        data: { messages: nextMessages, currentFiles: files },
      });
      setFiles(result.files);
      setMessages([...nextMessages, { role: "assistant", content: result.summary }]);
      setMobileView("preview");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
      setMessages([...nextMessages, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialFired.current) return;
    if (saved) {
      initialFired.current = true;
      try {
        const raw = localStorage.getItem("nuvic.savedProjects");
        const list = raw ? JSON.parse(raw) : [];
        const found = list.find((p: { id: string }) => p.id === saved);
        if (found) {
          setMessages(found.messages || []);
          setFiles(found.files || {});
          setMobileView("preview");
          toast.success(`Loaded "${found.name}"`);
          return;
        }
        toast.error("Saved project not found");
      } catch {
        toast.error("Could not load saved project");
      }
      return;
    }
    if (prompt) {
      initialFired.current = true;
      handleSend(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, saved]);

  const hasFiles = Object.keys(files).length > 0;

  const saveProject = () => {
    if (!hasFiles) {
      toast.error("Nothing to save yet — generate something first.");
      return;
    }
    const defaultName =
      messages.find((m) => m.role === "user")?.content.slice(0, 60) ||
      `Project ${new Date().toLocaleString()}`;
    const name = window.prompt("Name this project:", defaultName)?.trim();
    if (!name) return;
    try {
      const key = "nuvic.savedProjects";
      const raw = localStorage.getItem(key);
      const list: Array<{ id: string; name: string; savedAt: number; messages: ChatMessage[]; files: Record<string, string> }> =
        raw ? JSON.parse(raw) : [];
      list.unshift({ id: crypto.randomUUID(), name, savedAt: Date.now(), messages, files });
      localStorage.setItem(key, JSON.stringify(list.slice(0, 30)));
      toast.success("Project saved");
    } catch {
      toast.error("Could not save (storage full?)");
    }
  };

  return (
    <main className="dark relative flex h-[100dvh] w-screen flex-col overflow-hidden bg-background text-foreground md:flex-row">
      <div
        className={
          "min-h-0 w-full md:w-[38%] md:min-w-[340px] md:max-w-[520px] " +
          (mobileView === "chat" ? "flex flex-1" : "hidden md:flex")
        }
      >
        <div className="h-full w-full">
          <ChatPanel messages={messages} isLoading={isLoading} onSend={handleSend} />
        </div>
      </div>

      <div
        className={
          "min-h-0 w-full md:flex-1 " +
          (mobileView === "preview" ? "flex flex-1" : "hidden md:flex")
        }
      >
        <div className="h-full w-full">
          <PreviewPanel
            files={files}
            isLoading={isLoading}
            onBack={() => setMobileView("chat")}
          />
        </div>
      </div>

      {/* Floating Save button */}
      <button
        onClick={saveProject}
        disabled={!hasFiles}
        className="fixed right-3 top-3 z-50 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-[12px] font-medium text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-background disabled:opacity-40"
        aria-label="Save project"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <path d="M17 21v-8H7v8M7 3v5h8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Save
      </button>

      {/* Floating mobile bottom pill — Chat / Preview */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center md:hidden"
      >
        <div
          className="pointer-events-auto inline-flex items-center rounded-full border border-border/60 p-1 shadow-2xl backdrop-blur-md"
          style={{ background: "color-mix(in oklab, var(--builder-surface) 85%, transparent)" }}
        >
          <button
            onClick={() => setMobileView("chat")}
            className={
              "inline-flex items-center gap-1.5 rounded-full px-5 py-1.5 text-[12px] font-medium transition-all " +
              (mobileView === "chat"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground")
            }
          >
            Chat
          </button>
          <button
            onClick={() => setMobileView("preview")}
            disabled={!hasFiles && !isLoading}
            className={
              "inline-flex items-center gap-1.5 rounded-full px-5 py-1.5 text-[12px] font-medium transition-all disabled:opacity-40 " +
              (mobileView === "preview"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground")
            }
          >
            {mobileView === "preview" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            Preview
          </button>
        </div>
      </div>
    </main>
  );
}
