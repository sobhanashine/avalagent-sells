"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SERVICE_LABELS, STATUS_LABELS } from "@/lib/format";
import type { Customer } from "@/types/database";

interface CustomerFormProps {
  customer?: Customer;
  /** Required when standalone=false is *not* used; ignored when parent supplies its own footer */
  onCancel?: () => void;
  /** When true, the form uses its own action button (no parent wrapper needed) */
  standalone?: boolean;
  submitLabel?: string;
  /** Action called on success—e.g. close a modal or panel */
  onSuccess?: () => void;
}

export function CustomerFormFields({
  customer,
  onCancel,
  standalone = true,
  submitLabel,
  onSuccess,
}: CustomerFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(t);
  }, [error]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (customer) return; // when editing, parent form-action handles it
    e.preventDefault();
    if (!formRef.current) return;
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData(formRef.current);
      const res = await fetch("/api/customers", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed");
      }
      formRef.current.reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    onCancel?.();
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="instagram"
          label="Instagram"
          placeholder="username"
          defaultValue={customer?.instagram_username}
          required
        />
        <Input
          name="phone"
          label="Phone"
          placeholder="+1 555..."
          defaultValue={customer?.phone ?? ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          name="service"
          label="Service"
          defaultValue={customer?.service ?? "ai"}
          required
        >
          <option value="ai">{SERVICE_LABELS.ai}</option>
          <option value="website">{SERVICE_LABELS.website}</option>
          <option value="ai+website">{SERVICE_LABELS["ai+website"]}</option>
        </Select>
        <Select
          name="status"
          label="Status"
          defaultValue={customer?.status ?? "not_contacted"}
        >
          <option value="not_contacted">{STATUS_LABELS.not_contacted}</option>
          <option value="pending">{STATUS_LABELS.pending}</option>
          <option value="accepted">{STATUS_LABELS.accepted}</option>
          <option value="rejected">{STATUS_LABELS.rejected}</option>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="note"
          className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide"
        >
          Note
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          defaultValue={customer?.note ?? ""}
          placeholder="Add context about this lead…"
          className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-sm resize-none placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
        />
      </div>

      {error ? (
        <div className="text-sm text-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] border border-[color-mix(in_oklab,var(--danger)_20%,transparent)] rounded-md px-3 py-2">
          {error}
        </div>
      ) : null}

      {standalone ? (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="md" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={submitting}
          >
            {submitLabel ?? (customer ? "Save changes" : "Add customer")}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
