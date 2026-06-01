import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, Lock, X, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Mode = "signin" | "signup";

const friendlyError = (msg: string): string => {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) return "Please verify your email first.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in.";
  if (m.includes("password should be at least")) return "Password must be at least 6 characters.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a moment.";
  if (m.includes("invalid email")) return "Please enter a valid email address.";
  if (m.includes("network")) return "Network error. Check your connection.";
  return msg;
};

export function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const resetAndClose = useCallback(() => {
    setMode("signin");
    onClose();
  }, [onClose]);

  const closeDialog = useCallback(() => {
    if (busy) return;
    resetAndClose();
  }, [busy, resetAndClose]);

  // Reset state when dialog opens / closes
  useEffect(() => {
    if (open) {
      setErr(null);
      setBusy(false);
      setTimeout(() => emailRef.current?.focus(), 50);
    } else {
      setPassword("");
      setConfirm("");
      setShowPwd(false);
      setErr(null);
    }
  }, [open]);

  useEffect(() => {
    if (open && !authLoading && user && !busy) closeDialog();
  }, [open, authLoading, user, busy, closeDialog]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDialog();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeDialog]);

  if (!open) return null;

  const validate = (): string | null => {
    const trimmed = email.trim();
    if (!trimmed) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Please enter a valid email address.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (mode === "signup" && password !== confirm) return "Passwords do not match.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created — you're signed in");
          resetAndClose();
        } else if (data.user) {
          // Email confirmation required
          toast.success("Check your email to verify your account.");
          setMode("signin");
          setPassword("");
          setConfirm("");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back");
        resetAndClose();
      }
    } catch (e) {
      const msg = friendlyError(e instanceof Error ? e.message : "Authentication failed");
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setErr(null);
    setConfirm("");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center bg-background/80 p-4 backdrop-blur"
      onClick={closeDialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
        noValidate
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 id="auth-title" className="text-lg font-semibold text-foreground">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h2>
          <button
            type="button"
            onClick={closeDialog}
            disabled={busy}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
          {mode === "signin"
            ? "Welcome back — sign in to continue."
            : "Save and share your projects."}
        </p>

        <label htmlFor="auth-email" className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
          Email
        </label>
        <div className="relative mb-3">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="auth-email"
            ref={emailRef}
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-foreground/40 focus:outline-none disabled:opacity-60"
            placeholder="you@email.com"
          />
        </div>

        <label htmlFor="auth-password" className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
          Password
        </label>
        <div className="relative mb-3">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="auth-password"
            type={showPwd ? "text" : "password"}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-10 text-sm focus:border-foreground/40 focus:outline-none disabled:opacity-60"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            tabIndex={-1}
            aria-label={showPwd ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>

        {mode === "signup" && (
          <>
            <label htmlFor="auth-confirm" className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
              Confirm password
            </label>
            <div className="relative mb-3">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="auth-confirm"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={busy}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-foreground/40 focus:outline-none disabled:opacity-60"
                placeholder="••••••••"
              />
            </div>
          </>
        )}

        {err && (
          <div
            role="alert"
            className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-2 text-sm font-medium text-background transition-all hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={switchMode}
          disabled={busy}
          className="mt-3 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
