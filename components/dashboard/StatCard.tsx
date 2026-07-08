import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  sublabel,
  trend,
  intent = "neutral",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: { value: number; suffix?: string };
  intent?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const intentBar: Record<typeof intent, string> = {
    neutral: "bg-[var(--border-strong)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    danger: "bg-[var(--danger)]",
    info: "bg-[var(--accent)]",
  } as Record<typeof intent, string>;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 relative overflow-hidden">
      <div className={cn("absolute inset-x-0 top-0 h-0.5", intentBar[intent])} />
      <div className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
        {label}
      </div>
      <div className="flex items-end justify-between gap-3 mt-2">
        <div className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        {trend ? (
          <div
            className={cn(
              "text-xs font-medium tabular-nums",
              trend.value >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}
            {trend.suffix ?? "%"}
          </div>
        ) : null}
      </div>
      {sublabel ? (
        <div className="text-xs text-[var(--muted-foreground)] mt-1">
          {sublabel}
        </div>
      ) : null}
    </div>
  );
}
