"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialog() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be used inside Dialog");
  return ctx;
}

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open, onOpenChange, titleId }}>
      {open ? (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => onOpenChange(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto">
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </DialogContext.Provider>
  );
}

export function DialogContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = useDialog();
  if (!ctx.open) return null;
  return (
    <div
      className={cn(
        "relative w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-2xl animate-slide-up",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  const { titleId } = useDialog();
  return (
    <div className={cn("px-5 py-4 border-b border-[var(--border)]", className)}>
      <div id={titleId} className="text-base font-semibold">
        {children}
      </div>
    </div>
  );
}

export function DialogBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...rest} />;
}

export function DialogFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-5 py-4 border-t border-[var(--border)] flex items-center justify-end gap-2",
        className
      )}
      {...rest}
    />
  );
}

export function DialogClose({ children }: { children: React.ReactNode }) {
  const { onOpenChange } = useDialog();
  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      className="absolute top-3 right-3 size-7 rounded-full flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      aria-label="Close"
    >
      {children}
    </button>
  );
}
