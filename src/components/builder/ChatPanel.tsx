import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUp, ChevronDown, Gift, Home, Sparkles, Star, User } from "lucide-react";

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
  const [accountOpen, setAccountOpen] = useState(false);
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
      <div className="relative flex shrink-0 items-center gap-2 border-b border-border/60 px-3 py-2.5">
        {/* Account / workspace pill */}
        <div className="relative">
          <button
            onClick={() => setAccountOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-1.5 py-1 pr-2 text-foreground transition-colors hover:bg-background/70"
            aria-label="Account menu"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500 text-[11px] font-bold text-white">K</span>
            <span className="max-w-[110px] truncate text-[12px] font-medium sm:max-w-none">Prompt Sandbox</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {accountOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
              <div className="absolute left-0 top-11 z-50 w-72 overflow-hidden rounded-2xl border border-border/60 bg-background/95 p-2 shadow-2xl backdrop-blur-md">
                <Link
                  to="/"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Home className="h-3.5 w-3.5" />
                  Go to Home
                </Link>

                <div className="mt-1 flex items-center gap-2 px-2.5 py-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500 text-[12px] font-bold text-white">K</span>
                  <span className="flex-1 text-sm font-medium">Your workspace</span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">Free</span>
                </div>

                <div className="mx-1 mt-1 rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Credits</span>
                    <span className="text-xs text-muted-foreground">1.7 left ›</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/60">
                    <div className="h-full w-[15%] rounded-full bg-blue-500" />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                    Daily credits reset at midnight UTC
                  </div>
                </div>

                <a
                  href="https://lovable.dev/pricing"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setAccountOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Gift className="h-3.5 w-3.5" />
                  Get free credits
                </a>
                <a
                  href="https://lovable.dev/pricing"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Star className="h-3.5 w-3.5" />
                  Pricing & plans
                </a>
              </div>
            </>
          )}
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
