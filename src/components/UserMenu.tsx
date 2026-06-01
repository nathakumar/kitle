import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { User, LogOut, FolderOpen, Globe, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/AuthDialog";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  /** Visual size of the trigger button */
  size?: "sm" | "md";
  /** Dropdown alignment */
  align?: "left" | "right";
}

export function UserMenu({ size = "md", align = "right" }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const dim = "h-9 w-9";
  const iconSize = size === "sm" ? 14 : 16;

  const handleClick = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setOpen((v) => !v);
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? "";

  return (
    <>
      <div className="relative">
        <button
          onClick={handleClick}
          aria-label={user ? "Account menu" : "Sign in"}
          className={
            "inline-flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/40 text-foreground transition-colors hover:bg-background/70 " +
            dim
          }
        >
          {user ? (
            <span className="flex h-full w-full items-center justify-center rounded-full text-[12px] font-semibold text-primary-foreground" style={{ background: "var(--gradient-builder)" }}>
              {initial}
            </span>
          ) : (
            <User width={iconSize} height={iconSize} />
          )}
        </button>

        {open && user && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              className={
                "absolute top-11 z-50 w-64 overflow-hidden rounded-xl border border-border/60 bg-background/95 p-1 shadow-2xl backdrop-blur-md " +
                (align === "right" ? "right-0" : "left-0")
              }
            >
              <div className="border-b border-border/60 px-3 py-2">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Signed in as</div>
                <div className="truncate text-sm font-medium text-foreground">{user.email}</div>
              </div>
              <Link
                to="/projects"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                My projects
              </Link>
              <Link
                to="/gallery"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                <Globe className="h-3.5 w-3.5" />
                Public gallery
              </Link>
              <button
                onClick={async () => {
                  setOpen(false);
                  await supabase.auth.signOut();
                  toast.success("Signed out");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

/** Inline button used to trigger sign-in from anywhere. */
export function SignInButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-background/70 " +
          className
        }
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign in
      </button>
      <AuthDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
