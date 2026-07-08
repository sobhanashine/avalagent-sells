import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, label, id, ...rest }, ref) {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-9 px-3 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-sm",
            "placeholder:text-[var(--muted-foreground)] transition-colors",
            "focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...rest}
        />
      </div>
    );
  }
);
