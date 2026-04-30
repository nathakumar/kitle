import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatPanel, type ChatMessage } from "@/components/builder/ChatPanel";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import { generateProject } from "@/server/generate.functions";

type BuilderSearch = { prompt?: string };

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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
      setMessages([...nextMessages, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fire prompt from landing page once
  useEffect(() => {
    if (prompt && !initialFired.current) {
      initialFired.current = true;
      handleSend(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  return (
    <main className="dark flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="w-[36%] min-w-[320px] max-w-[520px]">
        <ChatPanel messages={messages} isLoading={isLoading} onSend={handleSend} />
      </div>
      <div className="flex-1">
        <PreviewPanel files={files} />
      </div>
    </main>
  );
}
