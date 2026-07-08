import Link from "next/link";
import { ServiceBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { formatRelative } from "@/lib/format";
import type { Customer } from "@/types/database";

export function RecentCustomers({ customers }: { customers: Customer[] }) {
  if (!customers.length) {
    return (
      <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">
        No customers yet. Add your first one to get started.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-[var(--border)]">
      {customers.map((c) => {
        const initials = c.instagram_username.slice(0, 2).toUpperCase();
        return (
          <li key={c.id}>
            <Link
              href={`/customers?id=${c.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--muted)]/40 transition-colors"
            >
              <span className="size-9 rounded-full bg-[var(--muted)] grid place-items-center text-xs font-semibold">
                {initials}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  @{c.instagram_username}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] truncate">
                  {c.phone || "no phone"} · {formatRelative(c.created_at)}
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1">
                <ServiceBadge service={c.service} />
                <StatusBadge status={c.status} />
              </div>
              <div className="sm:hidden">
                <StatusBadge status={c.status} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
