import { formatDateTime } from "@/lib/format";
import { ACTIVITY_LABELS, STATUS_LABELS } from "@/lib/format";
import type { Activity } from "@/types/database";

function describe(a: Activity) {
  if (a.type === "status_changed" && a.from_status && a.to_status) {
    return `Moved from ${STATUS_LABELS[a.from_status]} to ${STATUS_LABELS[a.to_status]}`;
  }
  if (a.type === "note_added") {
    return a.message ? `Note: "${truncate(a.message, 60)}"` : "Added a note";
  }
  if (a.type === "created") {
    return a.to_status
      ? `Started as ${STATUS_LABELS[a.to_status]}`
      : "Customer created";
  }
  return ACTIVITY_LABELS[a.type] ?? a.type;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

const ICON_BG: Record<string, string> = {
  created: "bg-[color-mix(in_oklab,#0ea5e9_15%,transparent)] text-[#0284c7]",
  status_changed: "bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] text-[var(--accent)]",
  note_added: "bg-[color-mix(in_oklab,#8b5cf6_15%,transparent)] text-[#7c3aed]",
  updated: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  deleted: "bg-[color-mix(in_oklab,var(--danger)_15%,transparent)] text-[var(--danger)]",
};

export function ActivityTimeline({ items }: { items: Activity[] }) {
  if (!items.length) {
    return (
      <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">
        No activity yet.
      </div>
    );
  }
  return (
    <ol className="flex flex-col">
      {items.map((a, i) => (
        <li key={a.id} className="flex gap-3 relative">
          {i < items.length - 1 ? (
            <span className="absolute left-[15px] top-8 bottom-0 w-px bg-[var(--border)]" />
          ) : null}
          <span
            className={`relative shrink-0 size-8 rounded-full grid place-items-center mt-0.5 ${ICON_BG[a.type] ?? ICON_BG.updated}`}
          >
            <span className="size-2 rounded-full bg-current" />
          </span>
          <div className="pb-5 flex-1 min-w-0">
            <div className="text-sm text-[var(--foreground)]">
              {describe(a)}
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {formatDateTime(a.created_at)}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
