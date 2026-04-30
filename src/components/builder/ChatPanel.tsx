import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, isLoading, onSend }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    onSend(text);
    setInput("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-sm font-semibold tracking-tight text-foreground">AI App Builder</h1>
        <p className="text-xs text-muted-foreground">Describe an app — get a live React + Vite preview.</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isLoading && (
          <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
            Try: <span className="text-foreground">"Build a tip calculator with a dark theme"</span> or{" "}
            <span className="text-foreground">"Make a markdown editor with live preview"</span>.
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-6 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                : "mr-6 rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
            }
          >
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wide opacity-70">
              {m.role === "user" ? "You" : "Assistant"}
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className="mr-6 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
            Generating project…
          </div>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-border p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          rows={3}
          placeholder={
            messages.length === 0 ? "Describe the app you want…" : "Refine: add a button, change colors…"
          }
          disabled={isLoading}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Enter to send · Shift+Enter for newline</span>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
