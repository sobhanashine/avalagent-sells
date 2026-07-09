import * as React from "react";
import Link from "next/link";
import { STATUS_LABELS } from "@/lib/format";
import type { StatusType } from "@/types/database";

const STATUS_BAR_COLORS: Record<StatusType, string> = {
  not_contacted: "#0ea5e9",
  pending: "var(--warning)",
  accepted: "var(--success)",
  rejected: "var(--danger)",
};

/** Funnel order: top of funnel first, accepted/rejected at the bottom. */
const FUNNEL_ORDER: StatusType[] = [
  "not_contacted",
  "pending",
  "accepted",
  "rejected",
];

export function ConversionFunnel({
  counts,
}: {
  counts: Partial<Record<StatusType, number>>;
}) {
  const entries = FUNNEL_ORDER.map((status) => ({
    status,
    count: counts[status] ?? 0,
  }));
  const max = Math.max(1, ...entries.map((e) => e.count));

  return (
    <div className="flex flex-col gap-4">
      {entries.map((e) => {
        const pct = (e.count / max) * 100;
        return (
          <Link 
            key={e.status} 
            href={`/customers?status=${e.status}`}
            className="flex flex-col gap-1.5 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--foreground)] flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ background: STATUS_BAR_COLORS[e.status] }}
                />
                {STATUS_LABELS[e.status]}
              </span>
              <span className="tabular-nums text-[var(--muted-foreground)]">
                {e.count}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-[var(--muted)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: STATUS_BAR_COLORS[e.status],
                }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
