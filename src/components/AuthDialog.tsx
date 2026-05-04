import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast.success("Account created — you're signed in");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          {mode === "signin" ? "Welcome back" : "Save and share your projects"}
        </p>

        <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
          placeholder="you@email.com"
        />
        <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-foreground py-2 text-sm font-medium text-background transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
