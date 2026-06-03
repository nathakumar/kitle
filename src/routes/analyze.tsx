import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { analyzeData, type AnalyzeResult, type ChartSpec } from "@/lib/analyze.functions";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Data Analysis & Visualization — AI Insights" },
      {
        name: "description",
        content:
          "Upload a CSV, JSON or text file, or describe your data. Get an AI-generated dashboard with KPIs, insights, charts, and recommendations.",
      },
      { property: "og:title", content: "AI Data Analysis & Visualization" },
      {
        property: "og:description",
        content: "Turn raw data or a prompt into a polished analytics report with charts.",
      },
    ],
  }),
  component: AnalyzePage,
});

const PALETTE = [
  "oklch(0.72 0.18 295)",
  "oklch(0.78 0.16 200)",
  "oklch(0.82 0.15 145)",
  "oklch(0.78 0.18 60)",
  "oklch(0.72 0.2 25)",
  "oklch(0.75 0.16 330)",
];

function AnalyzePage() {
  const analyze = useServerFn(analyzeData);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const onFile = async (f: File | null) => {
    if (!f) {
      setFileName("");
      setFileContent("");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB).");
      return;
    }
    const text = await f.text();
    setFileName(f.name);
    setFileContent(text);
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    const prompt = promptRef.current?.value?.trim() ?? "";
    if (!prompt && !fileContent) {
      toast.error("Add a prompt or upload a file.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await analyze({ data: { prompt, fileName, fileContent } });
      setResult(r);
      toast.success("Analysis ready");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-sm font-semibold tracking-tight">
            ← AI Builder
          </Link>
          <div className="text-xs text-muted-foreground">Data Analysis</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Analyze & visualize anything
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Upload a CSV / JSON / text file, paste data, or just describe what you want analyzed.
            You'll get KPIs, insights, charts, and recommendations.
          </p>
        </section>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-border/60 bg-card/40 p-5 shadow-lg backdrop-blur"
        >
          <textarea
            ref={promptRef}
            placeholder="e.g. Analyze sales trends and identify top products and risk segments…"
            rows={3}
            className="w-full resize-none rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border/60 bg-background/40 px-4 py-3 text-sm transition hover:border-primary/60 hover:bg-background/60">
              <input
                type="file"
                accept=".csv,.json,.txt,.tsv,.md,text/*,application/json"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              <span className="text-muted-foreground">
                {fileName ? `📄 ${fileName}` : "📎 Upload data file (CSV, JSON, TXT…)"}
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Analyzing…" : "Generate analysis ✨"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-border/40 bg-card/40"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        )}

        {result && (
          <div className="mt-10 space-y-10">
            <section className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <h2 className="text-lg font-semibold">Executive summary</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
            </section>

            {result.kpis?.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">Key metrics</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {result.kpis.map((k, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/60 to-card/20 p-5 shadow-md"
                    >
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        {k.label}
                      </div>
                      <div className="mt-2 text-3xl font-bold tracking-tight">{k.value}</div>
                      {k.delta && (
                        <div
                          className={`mt-1 text-xs font-medium ${
                            k.delta.trim().startsWith("-") ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {k.delta}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result.charts?.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">Visualizations</h2>
                <div className="grid gap-5 lg:grid-cols-2">
                  {result.charts.map((c, i) => (
                    <ChartCard key={i} spec={c} />
                  ))}
                </div>
              </section>
            )}

            {result.insights?.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">Insights</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.insights.map((it, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border/60 bg-card/40 p-5 transition hover:border-primary/40"
                    >
                      <div className="text-sm font-semibold">{it.title}</div>
                      <p className="mt-1.5 text-sm text-muted-foreground">{it.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result.recommendations?.length > 0 && (
              <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
                <h2 className="text-lg font-semibold">Recommended next steps</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">→</span>
                      <span className="text-muted-foreground">{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ChartCard({ spec }: { spec: ChartSpec }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
      <div className="mb-3">
        <div className="text-sm font-semibold">{spec.title}</div>
        {spec.description && (
          <div className="text-xs text-muted-foreground">{spec.description}</div>
        )}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(spec)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function renderChart(spec: ChartSpec) {
  const tooltipStyle = {
    background: "oklch(0.18 0.02 280)",
    border: "1px solid oklch(0.3 0.02 280)",
    borderRadius: 8,
    fontSize: 12,
  };

  if (spec.type === "pie") {
    const key = spec.yKeys[0] ?? "value";
    return (
      <PieChart>
        <Pie
          data={spec.data}
          dataKey={key}
          nameKey={spec.xKey}
          outerRadius={90}
          innerRadius={45}
          paddingAngle={2}
        >
          {spec.data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    );
  }

  if (spec.type === "line") {
    return (
      <LineChart data={spec.data}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 280)" />
        <XAxis dataKey={spec.xKey} stroke="oklch(0.6 0.02 280)" fontSize={11} />
        <YAxis stroke="oklch(0.6 0.02 280)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {spec.yKeys.map((k, i) => (
          <Line
            key={k}
            type="monotone"
            dataKey={k}
            stroke={PALETTE[i % PALETTE.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    );
  }

  if (spec.type === "area") {
    return (
      <AreaChart data={spec.data}>
        <defs>
          {spec.yKeys.map((k, i) => (
            <linearGradient key={k} id={`g-${k}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.6} />
              <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 280)" />
        <XAxis dataKey={spec.xKey} stroke="oklch(0.6 0.02 280)" fontSize={11} />
        <YAxis stroke="oklch(0.6 0.02 280)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {spec.yKeys.map((k, i) => (
          <Area
            key={k}
            type="monotone"
            dataKey={k}
            stroke={PALETTE[i % PALETTE.length]}
            fill={`url(#g-${k}-${i})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    );
  }

  return (
    <BarChart data={spec.data}>
      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 280)" />
      <XAxis dataKey={spec.xKey} stroke="oklch(0.6 0.02 280)" fontSize={11} />
      <YAxis stroke="oklch(0.6 0.02 280)" fontSize={11} />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend wrapperStyle={{ fontSize: 11 }} />
      {spec.yKeys.map((k, i) => (
        <Bar key={k} dataKey={k} fill={PALETTE[i % PALETTE.length]} radius={[6, 6, 0, 0]} />
      ))}
    </BarChart>
  );
}
