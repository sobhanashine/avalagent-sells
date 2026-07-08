import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export function Sidebar({
  items,
  pathname,
  footer,
}: {
  items: NavItem[];
  pathname: string;
  footer?: React.ReactNode;
}) {
  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex-col">
      <div className="px-5 h-14 flex items-center border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="size-7 rounded-[8px] bg-[var(--accent)] grid place-items-center text-[var(--accent-foreground)] font-bold text-xs">
            A
          </span>
          <span className="text-sm font-semibold tracking-tight">
            AvalAgent
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mt-px">
            Sales
          </span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 h-9 rounded-[var(--radius-md)] text-sm transition-colors",
                active
                  ? "bg-[var(--muted)] text-[var(--foreground)] font-medium"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <span
                className={cn(
                  "size-4 grid place-items-center",
                  active && "text-[var(--accent)]"
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      {footer ? (
        <div className="px-3 py-3 border-t border-[var(--border)]">{footer}</div>
      ) : null}
    </aside>
  );
}
