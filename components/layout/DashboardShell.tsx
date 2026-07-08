import * as React from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Settings, Plus } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";

const navItems = [
  { href: "/", label: "Overview", icon: <LayoutDashboard size={16} />, exact: true },
  { href: "/customers", label: "Customers", icon: <Users size={16} /> },
];

export function DashboardShell({
  children,
  pathname,
  email,
  rightHeader,
}: {
  children: React.ReactNode;
  pathname: string;
  email: string;
  rightHeader?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      <Sidebar
        pathname={pathname}
        items={navItems}
        footer={
          <Link
            href="/customers?new=1"
            className="flex items-center justify-center gap-2 h-9 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            New customer
          </Link>
        }
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav items={navItems} />
        <header className="hidden md:flex h-14 px-6 lg:px-8 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-20">
          <div className="text-sm text-[var(--muted-foreground)] truncate">
            {rightHeader}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Project on GitHub"
              className="hidden lg:inline-flex size-9 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              <Settings size={14} />
            </a>
            <UserMenu email={email} />
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
