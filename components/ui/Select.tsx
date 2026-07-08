import * as React from "react";
import { cn } from "@/lib/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, label, id, children, ...rest }, ref) {
    const reactId = React.useId();
    const selectId = id ?? reactId;
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide"
          >
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-9 px-3 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-sm",
            "focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...rest}
        >
          {children}
        </select>
      </div>
    );
  }
);
