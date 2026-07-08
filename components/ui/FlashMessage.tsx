"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface FlashMessage {
  type: "success" | "error";
  text: string;
}

/**
 * One-shot banner that picks up a `?flash=success|error&flash_text=...`
 * param on mount and auto-dismisses after 4s. The flash flag is consumed
 * lazily via a useState initializer (so we never call setState inside
 * an effect), then cleaned up + dismissed via an effect tied to message.
 */
export function FlashBanner({ className }: { className?: string }) {
  const [message, setMessage] = React.useState<FlashMessage | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const flash = params.get("flash");
    const text = params.get("flash_text");
    if (flash === "success" || flash === "error") {
      // Strip the flash params from the URL so a refresh doesn't replay it.
      const next = new URLSearchParams(params);
      next.delete("flash");
      next.delete("flash_text");
      const search = next.toString();
      const url =
        window.location.pathname + (search ? `?${search}` : "");
      window.history.replaceState(null, "", url);
      return { type: flash, text: text ?? "Done" };
    }
    return null;
  });

  React.useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(t);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-6 right-6 z-40 max-w-sm rounded-[var(--radius-lg)] border px-4 py-3 shadow-lg animate-slide-up",
        message.type === "success"
          ? "bg-[color-mix(in_oklab,var(--success)_10%,var(--surface))] border-[color-mix(in_oklab,var(--success)_30%,transparent)] text-[var(--success)]"
          : "bg-[color-mix(in_oklab,var(--danger)_10%,var(--surface))] border-[color-mix(in_oklab,var(--danger)_30%,transparent)] text-[var(--danger)]",
        className
      )}
    >
      <div className="text-sm font-medium">{message.text}</div>
    </div>
  );
}
