"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ServiceBadge, StatusBadge } from "@/components/ui/StatusBadge";
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 animate-fade-in"
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={close}
      />
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[var(--surface)] border-l border-[var(--border)] shadow-xl flex flex-col animate-slide-in-right">
        <header className="px-5 py-4 border-b border-[var(--border)] flex items-start gap-3">
          <div className="size-11 rounded-full bg-[var(--muted)] grid place-items-center text-sm font-semibold shrink-0">
            {customer.instagram_username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold truncate">
              @{customer.instagram_username}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <ServiceBadge service={customer.service} />
              <StatusBadge status={customer.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="size-8 rounded-full flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {editing ? (
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
            <CustomerFormFields
              customer={customer}
              standalone={false}
              onCancel={() => setEditing(false)}
            />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={saving}>
                  Save changes
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-[var(--border)] p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                    Phone
                  </div>
                  <div className="font-medium mt-1 tabular-nums">
                    {customer.phone || "—"}
                  </div>
                </div>
                <div className="rounded-md border border-[var(--border)] p-3">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                    Created
                  </div>
                  <div className="font-medium mt-1">
                    {formatRelative(customer.created_at)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
                  Set status
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => {
                    const isCurrent = customer.status === s;
                    return (
                      <Button
                        key={s}
                        variant={isCurrent ? "primary" : "secondary"}
                        size="sm"
                        loading={pendingStatus === s}
                        disabled={isCurrent}
                        onClick={() => changeStatus(s)}
                      >
                        {STATUS_LABELS[s]}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {customer.note ? (
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
                    Note
                  </div>
                  <div className="rounded-md border border-[var(--border)] p-3 text-sm whitespace-pre-wrap bg-[var(--muted)]/30">
                    {customer.note}
                  </div>
                </div>
              ) : null}

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)] mb-3">
                  Activity
                </div>
                <ActivityTimeline items={activities} />
              </div>
            </>
          )}
        </div>

        <footer className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            loading={deleting}
            onClick={handleDelete}
            className="text-[var(--danger)] hover:bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] hover:text-[var(--danger)]"
          >
            Delete
          </Button>
          {!editing ? (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit details
            </Button>
          ) : null}
        </footer>
      </aside>
    </div>
  );
}
