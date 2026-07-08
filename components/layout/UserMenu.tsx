"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-usermenu]")) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/auth/signout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  const initials = email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" data-usermenu>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 h-9 rounded-[var(--radius-md)] hover:bg-[var(--muted)] transition-colors"
      >
        <span className="size-7 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] grid place-items-center text-xs font-semibold">
          {initials}
        </span>
        <span className="text-sm hidden sm:block max-w-[160px] truncate">
          {email}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--muted-foreground)]">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 top-full mt-1 w-56 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-lg overflow-hidden animate-slide-up z-50">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <div className="text-xs text-[var(--muted-foreground)]">Signed in as</div>
            <div className="text-sm font-medium truncate mt-0.5">{email}</div>
          </div>
          <div className="p-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              loading={signingOut}
              onClick={signOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
