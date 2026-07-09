"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ServiceBadge, StatusBadge, CategoryBadge } from "@/components/ui/StatusBadge";
import { ActivityTimeline } from "./ActivityTimeline";
import { CustomerFormFields } from "./CustomerFormFields";
import { STATUS_LABELS, formatRelative } from "@/lib/format";
import {
  setCustomerStatus,
  updateCustomer,
  deleteCustomer,
} from "@/lib/actions/customers";
import type {
  Activity,
  Customer,
  StatusType,
} from "@/types/database";
import { STATUSES } from "@/types/database";

export function CustomerDetailPanel({
  customer,
  activities,
}: {
  customer: Customer;
  activities: Activity[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pendingStatus, setPendingStatus] = React.useState<StatusType | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function changeStatus(s: StatusType) {
    setPendingStatus(s);
    try {
      await setCustomerStatus(customer.id, s);
      router.refresh();
    } finally {
      setPendingStatus(null);
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("prev_note", customer.note ?? "");
    setSaving(true);
    try {
      const res = await updateCustomer(customer.id, fd);
      if (!res.ok) {
        alert(res.message ?? "Could not save");
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete @${customer.instagram_username}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteCustomer(customer.id);
      close();
    } finally {
      setDeleting(false);
    }
  }

  function close() {
    const next = new URLSearchParams(params.toString());
    next.delete("id");
    const qs = next.toString();
    router.push(qs ? `?${qs}` : "?");
  }

  // Define color-coded status styling for the status pill selections
  const statusConfig: Record<StatusType, { dot: string; activeBg: string; activeBorder: string; hoverBg: string }> = {
    not_contacted: {
      dot: "bg-sky-500",
      activeBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      activeBorder: "border-sky-500/50 ring-2 ring-sky-500/15",
      hoverBg: "hover:bg-sky-500/5 hover:border-sky-500/30",
    },
    pending: {
      dot: "bg-amber-500",
      activeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      activeBorder: "border-amber-500/50 ring-2 ring-amber-500/15",
      hoverBg: "hover:bg-amber-500/5 hover:border-amber-500/30",
    },
    accepted: {
      dot: "bg-emerald-500",
      activeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      activeBorder: "border-emerald-500/50 ring-2 ring-emerald-500/15",
      hoverBg: "hover:bg-emerald-500/5 hover:border-emerald-500/30",
    },
    rejected: {
      dot: "bg-rose-500",
      activeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      activeBorder: "border-rose-500/50 ring-2 ring-rose-500/15",
      hoverBg: "hover:bg-rose-500/5 hover:border-rose-500/30",
    },
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 animate-fade-in"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all"
        onClick={close}
      />
      <aside className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-[var(--surface-elevated)] border-l border-[var(--border)] shadow-2xl flex flex-col animate-slide-in-right z-50 overflow-hidden">
        {editing ? (
          <form onSubmit={handleEdit} className="flex flex-col h-full overflow-hidden">
            {/* Edit Mode Header */}
            <header className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3 shrink-0 bg-[var(--surface)]">
              <div className="size-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/10 shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-[var(--foreground)]">
                  Edit Profile
                </div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                  Modifying information for @{customer.instagram_username}
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="size-8 rounded-full flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </header>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <CustomerFormFields
                customer={customer}
                standalone={false}
                onCancel={() => setEditing(false)}
              />
            </div>

            {/* Sticky Form Footer */}
            <footer className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-end gap-3 shrink-0 bg-[var(--surface)]">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={saving}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="mr-0.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Save changes
              </Button>
            </footer>
          </form>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* View Mode Header */}
            <header className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3 shrink-0 bg-[var(--surface)]">
              <div className="size-11 rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 text-white font-bold grid place-items-center shadow-lg shadow-indigo-500/10 shrink-0 text-sm select-none">
                {customer.instagram_username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://instagram.com/${customer.instagram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-[var(--foreground)] truncate hover:text-[var(--accent)] hover:underline flex items-center gap-1 group"
                  >
                    @{customer.instagram_username}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <ServiceBadge service={customer.service} />
                  <StatusBadge status={customer.status} />
                  <CategoryBadge category={customer.category} />
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="size-8 rounded-full flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </header>

            {/* Scrollable Details Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="rounded-xl border border-[var(--border)] p-4.5 bg-[var(--surface)]/50 shadow-sm flex flex-col gap-1.5 relative group hover:border-[var(--border-strong)] transition-all">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Phone
                  </div>
                  <div className="text-sm font-semibold text-[var(--foreground)] tabular-nums mt-0.5">
                    {customer.phone || (
                      <span className="text-[var(--muted-foreground)] font-normal italic">Not provided</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border)] p-4.5 bg-[var(--surface)]/50 shadow-sm flex flex-col gap-1.5 relative group hover:border-[var(--border-strong)] transition-all">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Created
                  </div>
                  <div className="text-sm font-semibold text-[var(--foreground)] mt-0.5">
                    {formatRelative(customer.created_at)}
                  </div>
                </div>

                {customer.category && (
                  <div className="col-span-2 rounded-xl border border-[var(--border)] p-4.5 bg-[var(--surface)]/50 shadow-sm flex flex-col gap-1.5 hover:border-[var(--border-strong)] transition-all">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <circle cx="7" cy="7" r="1.5" fill="currentColor" />
                      </svg>
                      Category / Tag
                    </div>
                    <div className="mt-0.5">
                      <CategoryBadge category={customer.category} />
                    </div>
                  </div>
                )}
              </div>

              {/* Status Section */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Quick Status Update
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => {
                    const isCurrent = customer.status === s;
                    const cfg = statusConfig[s];
                    return (
                      <button
                        key={s}
                        disabled={isCurrent || pendingStatus === s}
                        onClick={() => changeStatus(s)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all relative ${
                          isCurrent
                            ? `${cfg.activeBg} ${cfg.activeBorder} cursor-default`
                            : `border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] ${cfg.hoverBg} active:scale-95`
                        } disabled:opacity-50`}
                      >
                        {pendingStatus === s ? (
                          <span className="size-3 rounded-full border border-current border-r-transparent animate-spin shrink-0" />
                        ) : (
                          <span className={`size-2 rounded-full shrink-0 ${cfg.dot}`} />
                        )}
                        <span className="truncate">{STATUS_LABELS[s]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note Section */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Internal Notes
                </div>
                {customer.note ? (
                  <div className="rounded-xl border border-[var(--border)] p-4 text-sm leading-relaxed text-[var(--foreground)] bg-[var(--surface)]/50 whitespace-pre-wrap relative shadow-sm hover:border-[var(--border-strong)] transition-all">
                    {customer.note}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[var(--border)] p-4.5 text-center text-xs text-[var(--muted-foreground)] bg-transparent">
                    No notes added yet. Click "Edit details" below to add customer context.
                  </div>
                )}
              </div>

              {/* Timeline Section */}
              <div className="space-y-3.5 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 14" />
                  </svg>
                  Activity Timeline
                </div>
                <div className="rounded-xl border border-[var(--border)] p-4 bg-[var(--surface)]/30">
                  <ActivityTimeline items={activities} />
                </div>
              </div>
            </div>

            {/* Sticky Details Footer */}
            <footer className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between gap-3 shrink-0 bg-[var(--surface)]">
              <Button
                variant="ghost"
                size="sm"
                loading={deleting}
                onClick={handleDelete}
                className="text-[var(--danger)] hover:bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] hover:text-[var(--danger)] h-9 px-3.5 rounded-xl font-semibold"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-0.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete Profile
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditing(true)}
                className="h-9 px-4 rounded-xl font-semibold flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Details
              </Button>
            </footer>
          </div>
        )}
      </aside>
    </div>
  );
}
