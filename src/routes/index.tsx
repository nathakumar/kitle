import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI App Builder — Idea to app in seconds" },
      {
        name: "description",
        content:
          "Describe your idea and get a working React + Vite + TypeScript app with a live preview. Your personal full-stack engineer.",
      },
      { property: "og:title", content: "AI App Builder — Idea to app in seconds" },
      {
        property: "og:description",
        content: "Describe your idea, get a working React + Vite app with live preview.",
      },
    ],
  }),
  component: LandingPage,
});

const EXAMPLES = [
  { label: "Remotion video", icon: "video" },
  { label: "Bill splitter", icon: "calc" },
  { label: "Markdown editor", icon: "edit" },
  { label: "Expense tracker", icon: "wallet" },
] as const;

function LandingPage() {
  const navigate = useNavigate({ from: "/" });
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const submittingRef = useRef(false);
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importHtml, setImportHtml] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const go = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    void navigate({ to: "/builder", search: { prompt: trimmed } }).catch(() => {
      submittingRef.current = false;
      setSubmitting(false);
      window.location.assign(`/builder?prompt=${encodeURIComponent(trimmed)}`);
    });
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const livePrompt = promptRef.current?.value ?? prompt;
    go(livePrompt);
  };

  const submitExample = (text: string) => {
    setPrompt(text);
    go(text);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submitImport = async () => {
    setImportError(null);
    let html = importHtml.trim();
    const url = importUrl.trim();
    if (!html && !url) {
      setImportError("Paste a URL or HTML to continue.");
      return;
    }
    if (!html && url) {
      setImporting(true);
      try {
        const proxied = `https://r.jina.ai/${url.replace(/^https?:\/\//, "https://")}`;
        const res = await fetch(proxied);
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        html = await res.text();
      } catch (err) {
        setImporting(false);
        setImportError(err instanceof Error ? err.message : "Failed to fetch URL.");
        return;
      }
      setImporting(false);
    }
    const truncated = html.slice(0, 18000);
    const userInstruction = prompt.trim() || "Recreate this website faithfully in React, then improve its design and structure while preserving content and brand.";
    const finalPrompt = `${userInstruction}\n\n--- EXISTING SITE${url ? ` (${url})` : ""} ---\n${truncated}\n--- END ---`;
    setImportOpen(false);
    go(finalPrompt);
  };

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      {/* Top nav pill */}
      <header className="px-3 pt-4 sm:px-4 sm:pt-6">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full border border-border bg-card/60 px-3 py-2 backdrop-blur sm:px-6 sm:py-3">
          <Link to="/" className="text-base font-semibold tracking-tight sm:text-lg">
            nuvic
          </Link>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <NavItem label="Product" />
            <NavItem label="Use Cases" />
            <NavItem label="Resources" />
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#hire" className="hover:text-foreground">Hire</a>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <IconButton aria-label="Language">
              <GlobeIcon />
            </IconButton>
            <IconButton aria-label="Account">
              <UserIcon />
            </IconButton>
            <IconButton aria-label="Menu">
              <MenuIcon />
            </IconButton>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-4 pt-10 pb-10 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl md:text-8xl">nuvic</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:mt-6 sm:text-lg">
            Idea to app in seconds, with your personal full stack engineer
          </p>
        </div>

        {/* Prompt card */}
        <form
          action="/builder"
          method="get"
          onSubmit={submit}
          className="mx-auto mt-6 w-full max-w-3xl rounded-2xl border border-border bg-card/60 p-2 shadow-2xl backdrop-blur sm:mt-10 sm:rounded-3xl"
        >
          <textarea
            ref={promptRef}
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKey}
            rows={3}
            placeholder="Build an app"
            className="w-full resize-none bg-transparent px-3 pt-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:px-5 sm:pt-4 sm:text-base"
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-1 sm:px-3 sm:pb-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CircleButton aria-label="Attach">
                <PaperclipIcon />
              </CircleButton>
              <CircleButton aria-label="Model">
                <ChipIcon />
              </CircleButton>
              <CircleButton aria-label="Quick">
                <BoltIcon />
              </CircleButton>
            </div>
            <button
              type="submit"
              aria-label="Send"
              aria-disabled={!prompt.trim() || submitting}
              disabled={submitting}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background shadow-md transition-all hover:scale-105 active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60 disabled:hover:scale-100 sm:h-10 sm:w-10"
            >
              {submitting ? <SpinnerIcon /> : <ArrowUpIcon />}
            </button>
          </div>
        </form>

        {/* Example chips */}
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-3">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => submitExample(ex.label)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-2 text-xs text-foreground transition-colors hover:bg-card sm:px-5 sm:py-2.5 sm:text-sm"
            >
              <ExampleIcon name={ex.icon} />
              {ex.label}
            </button>
          ))}
        </div>

        {/* Scroll cue */}
        <div className="mt-10 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:mt-16 sm:text-[11px]">
          Scroll to explore
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>
    </main>
  );
}

function NavItem({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1 hover:text-foreground">
      {label}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function IconButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
    >
      {children}
    </button>
  );
}

function CircleButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" strokeLinecap="round" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
function PaperclipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 12.5l-8.5 8.5a5 5 0 01-7-7l9-9a3.5 3.5 0 015 5l-9 9a2 2 0 01-3-3l8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" strokeLinecap="round" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
    </svg>
  );
}
function ExampleIcon({ name }: { name: string }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 } as const;
  if (name === "video")
    return (
      <svg {...common}>
        <rect x="3" y="6" width="13" height="12" rx="2" />
        <path d="M16 10l5-3v10l-5-3z" />
      </svg>
    );
  if (name === "calc")
    return (
      <svg {...common}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01M8 19h2M12 19h2M16 19h.01" strokeLinecap="round" />
      </svg>
    );
  if (name === "edit")
    return (
      <svg {...common}>
        <path d="M12 20h9" strokeLinecap="round" />
        <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18M16 15h2" strokeLinecap="round" />
    </svg>
  );
}
