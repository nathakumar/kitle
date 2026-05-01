import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Sparkles, User } from "lucide-react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
}

const SUGGESTIONS = [
  "Tip calculator with dark theme",
  "Markdown editor with live preview",
  "Pomodoro timer with sound",
];

export function ChatPanel({ messages, isLoading, onSend }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

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
    <div
      className="relative flex h-full flex-col border-r border-border/60"
      style={{ background: "var(--builder-surface)" }}
    >
      {/* subtle top glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: "var(--gradient-glow)" }}
      />

      {/* Header */}
      <div className="relative flex shrink-0 items-center gap-2.5 border-b border-border/60 px-4 py-3">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg shadow-lg"
          style={{ background: "var(--gradient-builder)", boxShadow: "var(--shadow-glow)" }}
        >
          <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <h1 className="text-[13px] font-semibold tracking-tight text-foreground">AI Builder</h1>
          <p className="truncate text-[11px] text-muted-foreground">Describe it. Watch it build.</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="builder-scroll relative flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""} animate-fade-in`}>
              <div
                className={
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold " +
                  (isUser
                    ? "bg-background/60 text-foreground border border-border/60"
                    : "text-white shadow-md")
                }
                style={!isUser ? { background: "var(--gradient-builder)" } : undefined}
              >
                {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              </div>
              <div
                className={
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed " +
                  (isUser
                    ? "rounded-tr-md bg-foreground text-background"
                    : "rounded-tl-md border border-border/60 bg-background/40 text-foreground")
                }
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 animate-fade-in">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-md"
              style={{ background: "var(--gradient-builder)" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl rounded-tl-md border border-border/60 bg-background/40 px-3.5 py-3">
              <div className="flex items-center gap-1">
                <span className="builder-dot h-1.5 w-1.5 rounded-full bg-foreground/60" style={{ animationDelay: "0ms" }} />
                <span className="builder-dot h-1.5 w-1.5 rounded-full bg-foreground/60" style={{ animationDelay: "150ms" }} />
                <span className="builder-dot h-1.5 w-1.5 rounded-full bg-foreground/60" style={{ animationDelay: "300ms" }} />
                <span className="ml-2 text-[11px] text-muted-foreground">Generating your project…</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="relative shrink-0 border-t border-border/60 p-3">
        <div
          className="builder-glow-border rounded-2xl border border-border/60 bg-background/60 p-2 transition-colors focus-within:border-border"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder={
              messages.length === 0 ? "Describe the app you want to build…" : "Ask for a refinement…"
            }
            disabled={isLoading}
            className="block w-full resize-none bg-transparent px-2 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-50"
            style={{ maxHeight: 200 }}
          />
          <div className="mt-1 flex items-center justify-between gap-2 px-1">
            <span className="text-[10px] text-muted-foreground/80">
              <kbd className="rounded border border-border/60 bg-background/60 px-1 py-px text-[9px]">Enter</kbd> send ·{" "}
              <kbd className="rounded border border-border/60 bg-background/60 px-1 py-px text-[9px]">Shift+Enter</kbd> newline
            </span>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="group flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              style={{ background: "var(--gradient-builder)", boxShadow: "var(--shadow-glow)" }}
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
