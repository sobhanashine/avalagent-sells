import * as React from "react";
import { STATUS_LABELS } from "@/lib/format";
import type { StatusType } from "@/types/database";

const STATUS_BAR_COLORS: Record<StatusType, string> = {
  pending: "var(--warning)",
  accepted: "var(--success)",
  rejected: "var(--danger)",
};

export function ConversionFunnel({
  counts,
}: {
  counts: Record<StatusType, number>;
}) {
  const entries: { status: StatusType; count: number }[] = [
    { status: "pending", count: counts.pending },
    { status: "accepted", count: counts.accepted },
    { status: "rejected", count: counts.rejected },
  ];
  const max = Math.max(1, ...entries.map((e) => e.count));

  return (
    <div className="flex flex-col gap-4">
      {entries.map((e) => {
        const pct = (e.count / max) * 100;
        return (
          <div key={e.status} className="flex flex-col gap-1.5">
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
          </div>
        );
      })}
    </div>
  );
}
