export function BentoLoader({ label = "Generating your app" }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8">
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-10 rounded-full opacity-70 blur-3xl"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="relative grid grid-cols-2 gap-2.5">
          <span className="bento-tile bento-tile-1" />
          <span className="bento-tile bento-tile-2" />
          <span className="bento-tile bento-tile-3" />
          <span className="bento-tile bento-tile-4" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="builder-gradient-text text-sm font-semibold uppercase tracking-[0.25em]">
          {label}
        </p>
        <div className="flex items-center gap-1">
          <span
            className="builder-dot h-1.5 w-1.5 rounded-full bg-foreground/50"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="builder-dot h-1.5 w-1.5 rounded-full bg-foreground/50"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="builder-dot h-1.5 w-1.5 rounded-full bg-foreground/50"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
