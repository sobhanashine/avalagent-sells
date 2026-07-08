"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Close the mobile sheet when the route changes. This is an intentional
  // side-effect of navigation, not derived state — disable the lint check.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)]">
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
        <div className="border-t border-[var(--border)] px-3 py-3 flex flex-col gap-0.5 bg-[var(--surface)] animate-slide-up">
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
                    ? "bg-[var(--muted)] font-medium"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                <span className="size-4">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}
