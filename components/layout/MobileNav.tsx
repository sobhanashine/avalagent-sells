"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export function MobileNav({ items, email }: { items: NavItem[]; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  // Close the mobile sheet when the route changes. This is an intentional
  // side-effect of navigation, not derived state — disable the lint check.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setOpen(false), [pathname]);

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
    ? email.split("@")[0].slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)] backdrop-blur-md">
      <div className="h-14 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="size-6 rounded-md bg-[var(--accent)] grid place-items-center text-[var(--accent-foreground)] font-bold text-xs">
            A
          </span>
          <span className="text-sm font-semibold">AvalAgent</span>
        </Link>
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="size-9 rounded-md flex items-center justify-center hover:bg-[var(--muted)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>
      {open ? (
        <div className="border-t border-[var(--border)] px-3 py-3 flex flex-col gap-2 bg-[var(--surface)] animate-slide-up">
          <div className="flex flex-col gap-0.5">
            {items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 h-10 rounded-[var(--radius-md)] text-sm",
                    active
                      ? "bg-[var(--muted)] font-medium text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
                  )}
                >
                  <span className="size-4">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
          {email ? (
            <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between px-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-7 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] grid place-items-center text-xs font-semibold shrink-0">
                  {initials}
                </span>
                <span className="text-xs font-medium truncate text-[var(--foreground)] max-w-[160px]">
                  {email}
                </span>
              </div>
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className="text-xs font-semibold text-[var(--danger)] hover:underline disabled:opacity-50 disabled:no-underline shrink-0"
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
