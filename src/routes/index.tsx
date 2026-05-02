import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

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

type Template = {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
  prompt: string;
};

const TEMPLATES: Template[] = [
  {
    id: "saas-landing",
    name: "SaaS Landing Page",
    category: "Marketing",
    description: "Modern hero, features grid, pricing tiers, testimonials and CTA.",
    preview: `<div style="font-family:Inter,system-ui;background:linear-gradient(180deg,#0b0f1a,#111827);color:#fff;padding:18px;height:100%">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px"><b>◆ Acme</b><span style="opacity:.6">Login</span></div>
      <div style="margin-top:24px;text-align:center">
        <div style="font-size:20px;font-weight:700;letter-spacing:-.02em">Ship faster with Acme</div>
        <div style="font-size:9px;opacity:.6;margin-top:6px">All-in-one platform for modern teams</div>
        <div style="margin-top:10px;display:inline-block;background:#6366f1;padding:5px 12px;border-radius:999px;font-size:9px">Get started →</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:18px">
        ${[1,2,3].map(()=>`<div style="background:#1f2937;border-radius:8px;padding:8px;font-size:8px"><div style="width:14px;height:14px;background:#6366f1;border-radius:4px;margin-bottom:4px"></div>Feature</div>`).join("")}
      </div>
    </div>`,
    prompt:
      "Build a polished modern SaaS landing page in React with: a sticky glassmorphism nav, a bold hero section with gradient headline and dual CTAs, a logo cloud, a 6-card feature grid with icons, a 3-column step-by-step 'How it works' section, social proof testimonials carousel, a 3-tier pricing table with a featured plan, an FAQ accordion, a final CTA banner, and a multi-column footer. Use semantic tokens, smooth scroll animations, and full responsive layout.",
  },
  {
    id: "portfolio",
    name: "Personal Portfolio",
    category: "Portfolio",
    description: "Bold typography, project gallery, about, skills, contact form.",
    preview: `<div style="font-family:Inter,system-ui;background:#fafaf9;color:#111;padding:18px;height:100%">
      <div style="display:flex;justify-content:space-between;font-size:10px"><b>Jane Doe</b><span>Work · About · Contact</span></div>
      <div style="margin-top:22px"><div style="font-size:24px;font-weight:800;letter-spacing:-.03em;line-height:1">Designer building<br/>thoughtful products.</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:18px">
        <div style="background:#e7e5e4;height:50px;border-radius:8px"></div>
        <div style="background:#fef3c7;height:50px;border-radius:8px"></div>
        <div style="background:#dbeafe;height:50px;border-radius:8px"></div>
        <div style="background:#fce7f3;height:50px;border-radius:8px"></div>
      </div>
    </div>`,
    prompt:
      "Build a striking personal portfolio website in React with: a minimalist nav, a huge serif/display hero introducing the person with an animated marquee of skills, an about section with a portrait placeholder and bio, a curated project case-study grid (6 projects with hover reveal), a skills/tech stack section, a testimonials section, a contact form, and a footer with social links. Use elegant typography, generous whitespace, smooth scroll reveals, and full responsiveness.",
  },
  {
    id: "ecommerce",
    name: "E-commerce Storefront",
    category: "Shop",
    description: "Product grid, hero banner, categories, cart preview, footer.",
    preview: `<div style="font-family:Inter,system-ui;background:#fff;color:#111;padding:14px;height:100%">
      <div style="display:flex;justify-content:space-between;font-size:10px;border-bottom:1px solid #eee;padding-bottom:8px"><b>SHOP</b><span>🔍 ♡ 🛒</span></div>
      <div style="margin-top:10px;background:linear-gradient(135deg,#fde68a,#f59e0b);border-radius:12px;padding:14px;color:#111"><b style="font-size:13px">Summer Sale -40%</b></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px">
        ${[1,2,3,4,5,6].map((i)=>`<div><div style="background:#f3f4f6;height:36px;border-radius:6px"></div><div style="font-size:8px;margin-top:3px">Item ${i}</div><div style="font-size:8px;font-weight:700">$${i*9}</div></div>`).join("")}
      </div>
    </div>`,
    prompt:
      "Build a beautiful e-commerce storefront in React with: a top promo bar, a header with logo, search, account and cart icons, a hero banner with a featured promotion, a horizontal category pill nav, a 'New arrivals' product grid (8 products with image, name, price, hover quick-add), a 'Shop by category' tile section, a curated collection feature row, customer reviews, a newsletter signup, and a rich footer. Use clean retail aesthetics, hover effects, and full responsive layout.",
  },
  {
    id: "dashboard",
    name: "Analytics Dashboard",
    category: "App",
    description: "Sidebar, KPI cards, charts, recent activity table.",
    preview: `<div style="font-family:Inter,system-ui;background:#0f172a;color:#fff;padding:0;height:100%;display:flex">
      <div style="width:48px;background:#020617;padding:8px;font-size:9px">▦<br/><br/>◉<br/><br/>♛</div>
      <div style="flex:1;padding:10px">
        <div style="font-size:11px;font-weight:700">Dashboard</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px">
          ${["12.4k","$48k","94%"].map(v=>`<div style="background:#1e293b;border-radius:6px;padding:6px;font-size:8px"><div style="opacity:.6">Metric</div><b style="font-size:11px">${v}</b></div>`).join("")}
        </div>
        <div style="background:#1e293b;border-radius:6px;height:50px;margin-top:6px;padding:6px;font-size:8px">📈 Chart</div>
      </div>
    </div>`,
    prompt:
      "Build a sophisticated analytics dashboard in React with: a collapsible sidebar nav with icons and labels, a top bar with search and user menu, a row of 4 KPI stat cards with sparklines and delta indicators, a large area chart for revenue over time, a bar chart for traffic sources, a donut chart for user breakdown, a recent transactions table with status badges and pagination, and a notifications panel. Use a polished dark theme, recharts for visualizations, and a responsive grid layout.",
  },
  {
    id: "blog",
    name: "Magazine Blog",
    category: "Content",
    description: "Featured story, article grid, categories, newsletter.",
    preview: `<div style="font-family:Georgia,serif;background:#fffbeb;color:#1c1917;padding:14px;height:100%">
      <div style="text-align:center;border-bottom:2px solid #1c1917;padding-bottom:6px;font-size:14px;font-weight:700;letter-spacing:.2em">THE DAILY</div>
      <div style="margin-top:10px"><div style="background:#e7e5e4;height:40px;border-radius:4px"></div><div style="font-size:11px;font-weight:700;margin-top:4px;line-height:1.2">The future of independent publishing</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;font-size:9px">
        <div><div style="background:#d6d3d1;height:24px;border-radius:3px"></div><div style="margin-top:2px">Article one headline</div></div>
        <div><div style="background:#d6d3d1;height:24px;border-radius:3px"></div><div style="margin-top:2px">Article two headline</div></div>
      </div>
    </div>`,
    prompt:
      "Build an editorial magazine-style blog in React with: a centered masthead with serif typography, a horizontal category nav, a large featured story hero with image, category badge, headline, dek and byline, a 3-column 'Latest stories' grid (9 articles), a 'Most read' sidebar list, a topic-organized 'Sections' area, a newsletter signup band, and an elegant footer. Use serif headlines, sans-serif body, generous typography hierarchy, and responsive layout.",
  },
  {
    id: "restaurant",
    name: "Restaurant Site",
    category: "Hospitality",
    description: "Hero, menu sections, gallery, reservation, location.",
    preview: `<div style="font-family:Georgia,serif;background:#1c1917;color:#fef3c7;padding:14px;height:100%">
      <div style="text-align:center;font-size:9px;letter-spacing:.3em;opacity:.7">EST. 2014</div>
      <div style="text-align:center;font-size:22px;font-weight:700;margin-top:4px;font-style:italic">Maison</div>
      <div style="text-align:center;font-size:9px;opacity:.7;margin-top:4px">Seasonal · French · Tasting menu</div>
      <div style="margin-top:14px;border-top:1px solid #44403c;border-bottom:1px solid #44403c;padding:8px 0;font-size:9px;display:flex;justify-content:space-between"><span>Beef tartare</span><span>· · · ·</span><span>$24</span></div>
      <div style="font-size:9px;display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #44403c"><span>Duck confit</span><span>· · · ·</span><span>$32</span></div>
    </div>`,
    prompt:
      "Build an elegant restaurant website in React with: a full-bleed hero with restaurant name in display serif, tagline and CTA to reserve, an 'Our story' section with image, a beautifully typeset menu section (Starters / Mains / Desserts / Drinks) with dotted price leaders, a photo gallery grid, a chef profile, a reservation form, a location & hours panel with embedded-map placeholder, and a footer with social links. Use warm sophisticated colors, serif/sans pairing, and responsive layout.",
  },
];


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
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Array<{ id: string; name: string; savedAt: number }>>([]);

  useEffect(() => {
    if (!savedOpen) return;
    try {
      const raw = localStorage.getItem("nuvic.savedProjects");
      const list = raw ? JSON.parse(raw) : [];
      setSavedProjects(list.map((p: { id: string; name: string; savedAt: number }) => ({ id: p.id, name: p.name, savedAt: p.savedAt })));
    } catch {
      setSavedProjects([]);
    }
  }, [savedOpen]);

  const openSavedProject = (id: string) => {
    setSavedOpen(false);
    void navigate({ to: "/builder", search: { saved: id } }).catch(() => {
      window.location.assign(`/builder?saved=${encodeURIComponent(id)}`);
    });
  };

  const deleteSavedProject = (id: string) => {
    try {
      const raw = localStorage.getItem("nuvic.savedProjects");
      const list = raw ? JSON.parse(raw) : [];
      const next = list.filter((p: { id: string }) => p.id !== id);
      localStorage.setItem("nuvic.savedProjects", JSON.stringify(next));
      setSavedProjects(next.map((p: { id: string; name: string; savedAt: number }) => ({ id: p.id, name: p.name, savedAt: p.savedAt })));
    } catch {
      /* noop */
    }
  };

  const pickTemplate = (tpl: Template) => {
    setTemplatesOpen(false);
    go(tpl.prompt);
  };

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
          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/30 bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground/10 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 20h9" strokeLinecap="round" />
              <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinejoin="round" />
            </svg>
            Edit existing site
          </button>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/20 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3v18h18" strokeLinecap="round" />
              <path d="M7 14l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Analyze data
          </Link>
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

        {importOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur"
            onClick={() => setImportOpen(false)}
          >
            <div
              className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Edit an existing website</h2>
                <button
                  onClick={() => setImportOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Paste a URL or the page HTML. We'll recreate it in React, then apply your changes.
              </p>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
              />
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Or paste HTML</label>
              <textarea
                rows={5}
                placeholder="<html>..."
                value={importHtml}
                onChange={(e) => setImportHtml(e.target.value)}
                className="mb-3 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs focus:border-foreground/40 focus:outline-none"
              />
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">What should we change? (optional)</label>
              <textarea
                rows={2}
                placeholder="Modernize the design, add a pricing section, improve mobile…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mb-4 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
              />
              {importError && <p className="mb-3 text-xs text-red-400">{importError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setImportOpen(false)}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={submitImport}
                  disabled={importing}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                >
                  {importing ? <SpinnerIcon /> : null}
                  {importing ? "Fetching…" : "Import & build"}
                </button>
              </div>
            </div>
          </div>
        )}

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
