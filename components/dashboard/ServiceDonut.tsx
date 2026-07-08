import * as React from "react";
import { SERVICE_LABELS } from "@/lib/format";
import type { ServiceType } from "@/types/database";

const SEGMENT_STROKES: Record<ServiceType, string> = {
  ai: "var(--accent)",
  website: "#0ea5e9",
  "ai+website": "#8b5cf6",
};

interface Slice {
  service: ServiceType;
  count: number;
}

export function ServiceDonut({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const size = 220;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [active, setActive] = React.useState<ServiceType | null>(null);

  let offset = 0;
  const arcs = data.map((d) => {
    const length = total > 0 ? (d.count / total) * circumference : 0;
    const arc = (
      <circle
        key={d.service}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={SEGMENT_STROKES[d.service]}
        strokeWidth={stroke}
        strokeDasharray={`${length} ${circumference}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeLinecap="butt"
        className="transition-opacity duration-200 cursor-pointer"
        opacity={active && active !== d.service ? 0.35 : 1}
        onMouseEnter={() => setActive(d.service)}
        onMouseLeave={() => setActive(null)}
      />
    );
    offset += length;
    return arc;
  });

  const focused = active ? data.find((d) => d.service === active) : null;
  const focusedPct =
    focused && total > 0 ? Math.round((focused.count / total) * 100) : null;

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {total === 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--border)"
              strokeWidth={stroke}
            />
          ) : (
            arcs
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl font-semibold tabular-nums">
            {focused ? focused.count : total}
          </div>
          <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {focused ? SERVICE_LABELS[focused.service] : "total customers"}
          </div>
          {focusedPct !== null && total > 0 ? (
            <div className="text-[11px] text-[var(--muted-foreground)] mt-1 tabular-nums">
              {focusedPct}%
            </div>
          ) : null}
        </div>
      </div>
      <ul className="flex flex-col gap-2.5 flex-1 min-w-0">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <li
              key={d.service}
              className="text-sm flex items-center gap-2.5"
              onMouseEnter={() => setActive(d.service)}
              onMouseLeave={() => setActive(null)}
            >
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ background: SEGMENT_STROKES[d.service] }}
              />
              <span className="flex-1 truncate text-[var(--foreground)]">
                {SERVICE_LABELS[d.service]}
              </span>
              <span className="tabular-nums text-[var(--muted-foreground)]">
                {d.count}
              </span>
              <span className="tabular-nums text-[var(--muted-foreground)] w-10 text-right">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
