import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChatPanel, type ChatMessage } from "@/components/builder/ChatPanel";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import { generateProject } from "@/server/generate.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI App Builder — Prompt to React + Vite preview" },
      {
        name: "description",
        content:
          "Describe an app and instantly get a live React + Vite + TypeScript preview powered by AI. Iterate via chat.",
      },
    ],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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
