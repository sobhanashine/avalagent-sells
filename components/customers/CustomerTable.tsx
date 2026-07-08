"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Customer, StatusType } from "@/types/database";
import { bulkSetCustomerStatus, bulkDeleteCustomers } from "@/lib/actions/customers";
import { STATUS_LABELS } from "@/lib/format";

export function CustomerTable({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [pending, setPending] = React.useState<null | "delete" | StatusType>(null);

  // Reset the selection whenever filters / sort change. This is intentional
  // UX behavior, not derived state — the user's ticked rows are no longer
  // in view, so we clear the bulk-action bar.
  const paramsKey = params.toString();
  const [prevParamsKey, setPrevParamsKey] = React.useState(paramsKey);
  if (paramsKey !== prevParamsKey) {
    setPrevParamsKey(paramsKey);
    setSelected(new Set());
  }

  const allSelected =
    customers.length > 0 && customers.every((c) => selected.has(c.id));
  const someSelected = selected.size > 0 && !allSelected;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === customers.length
        ? new Set()
        : new Set(customers.map((c) => c.id))
    );
  }

  async function bulkAction(action: "delete" | StatusType) {
    const ids = [...selected];
    if (!ids.length) return;
    setPending(action);
    try {
      if (action === "delete") {
        await bulkDeleteCustomers(ids);
      } else {
        await bulkSetCustomerStatus(ids, action);
      }
      setSelected(new Set());
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  if (!customers.length) {
    return (
      <div className="py-16 text-center">
        <div className="text-sm font-medium">No customers match your filters</div>
        <div className="text-xs text-[var(--muted-foreground)] mt-1">
          Try clearing filters or adding a new customer.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[var(--muted-foreground)] border-b border-[var(--border)] bg-[var(--surface)]">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className="accent-[var(--accent)] size-4"
                />
              </th>
              <th className="px-2 py-3 font-medium">Customer</th>
              <th className="px-2 py-3 font-medium hidden md:table-cell">Phone</th>
              <th className="px-2 py-3 font-medium">Service</th>
              <th className="px-2 py-3 font-medium">Status</th>
              <th className="px-2 py-3 font-medium hidden lg:table-cell">Note</th>
              <th className="px-2 py-3 font-medium hidden lg:table-cell text-right">Added</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {customers.map((c) => {
              const checked = selected.has(c.id);
              return (
                <tr
                  key={c.id}
                  className={cn(
                    "group transition-colors",
                    checked
                      ? "bg-[color-mix(in_oklab,var(--accent)_6%,transparent)]"
                      : "hover:bg-[var(--muted)]/40"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select @${c.instagram_username}`}
                      checked={checked}
                      onChange={() => toggle(c.id)}
                      className="accent-[var(--accent)] size-4"
                    />
                  </td>
                  <td className="px-2 py-3">
                    <Link
                      href={`/customers?id=${c.id}`}
                      className="flex items-center gap-3 group/link"
                    >
                      <span className="size-8 rounded-full bg-[var(--muted)] grid place-items-center text-[11px] font-semibold">
                        {c.instagram_username.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium group-hover/link:text-[var(--accent)] transition-colors">
                        @{c.instagram_username}
                      </span>
                    </Link>
                  </td>
                  <td className="px-2 py-3 hidden md:table-cell text-[var(--muted-foreground)] tabular-nums">
                    {c.phone || "—"}
                  </td>
                  <td className="px-2 py-3">
                    <ServiceBadge service={c.service} />
                  </td>
                  <td className="px-2 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-2 py-3 hidden lg:table-cell text-[var(--muted-foreground)] max-w-[260px] truncate">
                    {c.note || "—"}
                  </td>
                  <td className="px-2 py-3 hidden lg:table-cell text-right text-[var(--muted-foreground)] text-xs">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/customers?id=${c.id}`}
                      className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                      aria-label="Open detail"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected.size > 0 ? (
        <div className="sticky bottom-4 left-4 right-4 mt-4 z-30 animate-slide-up">
          <div className="max-w-3xl mx-auto bg-[var(--surface-elevated)] border border-[var(--border)] shadow-lg rounded-[var(--radius-lg)] px-4 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium tabular-nums">
              {selected.size} selected
            </span>
            <span className="size-1 rounded-full bg-[var(--border-strong)]" />
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["pending", "accepted", "rejected"] as StatusType[]).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="secondary"
                  loading={pending === s}
                  onClick={() => bulkAction(s)}
                >
                  Mark {STATUS_LABELS[s]}
                </Button>
              ))}
              <Button
                size="sm"
                variant="danger"
                loading={pending === "delete"}
                onClick={() => bulkAction("delete")}
              >
                Delete
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
