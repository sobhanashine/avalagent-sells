import * as React from "react";
import { cn } from "@/lib/cn";

type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "violet"
  | "indigo";

const toneStyles: Record<Tone, string> = {
  neutral:
    "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]",
  success:
    "bg-[color-mix(in_oklab,var(--success)_12%,transparent)] text-[var(--success)] border-[color-mix(in_oklab,var(--success)_25%,transparent)]",
  warning:
    "bg-[color-mix(in_oklab,var(--warning)_12%,transparent)] text-[var(--warning)] border-[color-mix(in_oklab,var(--warning)_25%,transparent)]",
  danger:
    "bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-[var(--danger)] border-[color-mix(in_oklab,var(--danger)_25%,transparent)]",
  info:
    "bg-[color-mix(in_oklab,#0ea5e9_12%,transparent)] text-[#0284c7] border-[color-mix(in_oklab,#0ea5e9_25%,transparent)]",
  violet:
    "bg-[color-mix(in_oklab,#8b5cf6_12%,transparent)] text-[#7c3aed] border-[color-mix(in_oklab,#8b5cf6_25%,transparent)]",
  indigo:
    "bg-[color-mix(in_oklab,#6366f1_12%,transparent)] text-[#4f46e5] border-[color-mix(in_oklab,#6366f1_25%,transparent)]",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

export function Badge({ className, tone = "neutral", dot, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        toneStyles[tone],
        className
      )}
      {...rest}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
