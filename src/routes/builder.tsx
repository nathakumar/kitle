import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatPanel, type ChatMessage } from "@/components/builder/ChatPanel";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import { generateProject } from "@/server/generate.functions";

type BuilderSearch = { prompt?: string };
type MobileView = "chat" | "preview";

export const Route = createFileRoute("/builder")({
  validateSearch: (search: Record<string, unknown>): BuilderSearch => ({
    prompt: typeof search.prompt === "string" ? search.prompt : undefined,
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
  const { prompt } = Route.useSearch();
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
    if (prompt && !initialFired.current) {
      initialFired.current = true;
      handleSend(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  const hasFiles = Object.keys(files).length > 0;

  return (
    <main className="dark flex h-[100dvh] w-screen flex-col overflow-hidden bg-background text-foreground md:flex-row">
      {/* Mobile-only top bar with view switcher */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 py-2 md:hidden">
        <span className="text-xs font-semibold text-foreground">AI Builder</span>
        <div className="inline-flex rounded-md border border-border bg-background p-0.5">
          <button
            onClick={() => setMobileView("chat")}
            className={
              "rounded px-3 py-1 text-xs font-medium transition-colors " +
              (mobileView === "chat" ? "bg-primary text-primary-foreground" : "text-muted-foreground")
            }
          >
            Chat
          </button>
          <button
            onClick={() => setMobileView("preview")}
            disabled={!hasFiles && !isLoading}
            className={
              "rounded px-3 py-1 text-xs font-medium transition-colors disabled:opacity-40 " +
              (mobileView === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground")
            }
          >
            Preview
          </button>
        </div>
      </div>

      <div
        className={
          "min-h-0 w-full md:w-[36%] md:min-w-[320px] md:max-w-[520px] " +
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
          <PreviewPanel files={files} />
        </div>
      </div>
    </main>
  );
}
