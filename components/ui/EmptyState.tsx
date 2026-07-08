import * as React from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-14 rounded-[var(--radius-lg)]",
        className
      )}
    >
      {icon ? (
        <div className="size-12 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] mb-4">
          {icon}
        </div>
      ) : null}
      <div className="text-sm font-semibold text-[var(--foreground)]">
        {title}
      </div>
      {description ? (
        <div className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm">
          {description}
        </div>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
