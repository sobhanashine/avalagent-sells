"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { SERVICE_LABELS, STATUS_LABELS } from "@/lib/format";
import type { Customer, ServiceType, StatusType } from "@/types/database";

interface CustomerFormProps {
  customer?: Customer;
  /** Required when standalone=false is *not* used; ignored when parent supplies its own footer */
  onCancel?: () => void;
  /** When true, the form uses its own action button (no parent wrapper needed) */
  standalone?: boolean;
  submitLabel?: string;
  /** Action called on success—e.g. close a modal or panel */
  onSuccess?: () => void;
  /** List of unique categories already stored in database */
  existingCategories?: string[];
}

export function CustomerFormFields({
  customer,
  onCancel,
  standalone = true,
  submitLabel,
  onSuccess,
  existingCategories = [],
}: CustomerFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form states for custom selectors
  const [selectedService, setSelectedService] = React.useState<ServiceType>(
    customer?.service ?? "ai"
  );
  const [selectedStatus, setSelectedStatus] = React.useState<StatusType>(
    customer?.status ?? "not_contacted"
  );
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    customer?.category ?? null
  );
  const [customCategories, setCustomCategories] = React.useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = React.useState("");

  function handleAddCustomCategory() {
    const val = newCategoryInput.trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (!val) return;
    
    // Add to session custom list if not already in presets, existing, or custom lists
    const presets = ["cold_lead", "warm_lead", "hot_lead", "vip", "enterprise"];
    if (
      !presets.includes(val) &&
      !existingCategories.includes(val) &&
      !customCategories.includes(val) &&
      customer?.category !== val
    ) {
      setCustomCategories((prev) => [...prev, val]);
    }
    setSelectedCategory(val);
    setNewCategoryInput("");
  }

  React.useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
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
      // Ensure custom select values are present in FormData if hidden input doesn't propagate (it will, but safe check)
      fd.set("service", selectedService);
      fd.set("status", selectedStatus);
      fd.set("category", selectedCategory ?? "");

      const res = await fetch("/api/customers", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save customer");
      }
      formRef.current.reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add customer");
    } finally {
      setSubmitting(false);
    }
  }

  const serviceOptions: { value: ServiceType; label: string; desc: string }[] = [
    {
      value: "ai",
      label: "AI Agent",
      desc: "Custom AI chatbot & lead qualification workflow",
    },
    {
      value: "website",
      label: "Website",
      desc: "High-performance, modern marketing website",
    },
    {
      value: "ai+website",
      label: "AI + Website",
      desc: "Complete digital solution with CRM integration",
    },
  ];

  const statusOptions: { value: StatusType; label: string; activeClass: string; hoverClass: string; dotColor: string }[] = [
    {
      value: "not_contacted",
      label: "Not Contacted",
      activeClass: "border-sky-500/50 bg-sky-500/8 text-sky-600 dark:text-sky-400 ring-2 ring-sky-500/15",
      hoverClass: "hover:border-sky-500/30 hover:bg-sky-500/5",
      dotColor: "bg-sky-500",
    },
    {
      value: "pending",
      label: "Pending",
      activeClass: "border-amber-500/50 bg-amber-500/8 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/15",
      hoverClass: "hover:border-amber-500/30 hover:bg-amber-500/5",
      dotColor: "bg-amber-500",
    },
    {
      value: "accepted",
      label: "Accepted",
      activeClass: "border-emerald-500/50 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/15",
      hoverClass: "hover:border-emerald-500/30 hover:bg-emerald-500/5",
      dotColor: "bg-emerald-500",
    },
    {
      value: "rejected",
      label: "Rejected",
      activeClass: "border-rose-500/50 bg-rose-500/8 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/15",
      hoverClass: "hover:border-rose-500/30 hover:bg-rose-500/5",
      dotColor: "bg-rose-500",
    },
  ];

  const presets = ["cold_lead", "warm_lead", "hot_lead", "vip", "enterprise"];
  const allCategories = Array.from(
    new Set([
      ...presets,
      ...existingCategories,
      ...(customer?.category ? [customer.category] : []),
      ...customCategories,
    ])
  );

  const categoryTones: Record<string, string> = {
    cold_lead: "border-sky-500/50 bg-sky-500/8 text-sky-600 dark:text-sky-400 ring-2 ring-sky-500/15",
    warm_lead: "border-amber-500/50 bg-amber-500/8 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/15",
    hot_lead: "border-rose-500/50 bg-rose-500/8 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/15",
    vip: "border-violet-500/50 bg-violet-500/8 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/15",
    enterprise: "border-emerald-500/50 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/15",
  };

  const badgeColors = ["indigo", "info", "violet", "warning", "danger", "neutral", "success"] as const;
  const toneClasses: Record<string, string> = {
    indigo: "border-indigo-500/50 bg-indigo-500/8 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/15",
    info: "border-sky-500/50 bg-sky-500/8 text-sky-600 dark:text-sky-400 ring-2 ring-sky-500/15",
    violet: "border-violet-500/50 bg-violet-500/8 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/15",
    warning: "border-amber-500/50 bg-amber-500/8 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/15",
    danger: "border-rose-500/50 bg-rose-500/8 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/15",
    neutral: "border-slate-500/50 bg-slate-500/8 text-slate-600 dark:text-slate-400 ring-2 ring-slate-500/15",
    success: "border-emerald-500/50 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/15",
  };

  const getCategoryClass = (cat: string) => {
    if (categoryTones[cat]) return categoryTones[cat];
    let hash = 0;
    for (let i = 0; i < cat.length; i++) {
      hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    }
    const tone = badgeColors[Math.abs(hash) % badgeColors.length];
    return toneClasses[tone];
  };

  const getCategoryLabel = (cat: string) => {
    let label = cat
      .split(/[_-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return label.toLowerCase() === "vip" ? "VIP" : label;
  };

  const formFieldsContent = (
    <div className="space-y-5">
      {/* Hidden inputs to make sure standard forms get the values */}
      <input type="hidden" name="service" value={selectedService} />
      <input type="hidden" name="status" value={selectedStatus} />
      <input type="hidden" name="category" value={selectedCategory ?? ""} />

      {/* Grid for Instagram and Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Instagram Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Instagram Username
          </label>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)] select-none">@</span>
            <input
              type="text"
              name="instagram_username"
              required
              placeholder="username"
              defaultValue={customer?.instagram_username}
              className="w-full h-10 pl-7 pr-3 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-sm transition-all focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 hover:border-[var(--border-strong)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>
        </div>

        {/* Phone Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="+1 555-0199"
            defaultValue={customer?.phone ?? ""}
            className="w-full h-10 px-3 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-sm transition-all focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 hover:border-[var(--border-strong)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
      </div>

      {/* Service Selector Redesign */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          Select Service
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {serviceOptions.map((opt) => {
            const isSelected = selectedService === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedService(opt.value)}
                className={`flex items-start justify-start p-3.5 rounded-[var(--radius-md)] border text-left transition-all relative ${
                  isSelected
                    ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_6%,transparent)] ring-2 ring-[var(--accent)]/15 shadow-sm"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[color-mix(in_oklab,var(--border)_15%,transparent)]"
                }`}
              >
                <div className="pr-4">
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    {opt.label}
                    {isSelected && (
                      <span className="size-4 rounded-full bg-[var(--accent)] text-white inline-flex items-center justify-center p-0.5 shrink-0 scale-95 animate-fade-in">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
                    {opt.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Selector Redesign */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Customer Status
        </label>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((opt) => {
            const isSelected = selectedStatus === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedStatus(opt.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] border text-sm font-medium transition-all ${
                  isSelected
                    ? opt.activeClass
                    : `border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] ${opt.hoverClass}`
                }`}
              >
                <span className={`size-2 rounded-full shrink-0 ${opt.dotColor}`} />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Selector Redesign */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <circle cx="7" cy="7" r="1.5" fill="currentColor" />
          </svg>
          Customer Category / Tag
        </label>
        <div className="flex flex-wrap gap-2">
          {/* None Option */}
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === null
                ? "border-slate-500/50 bg-[color-mix(in_oklab,var(--border-strong)_20%,transparent)] text-[var(--foreground)] ring-2 ring-slate-500/10"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[color-mix(in_oklab,var(--border)_15%,transparent)]"
            }`}
          >
            None
          </button>

          {/* Dynamic Options */}
          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? getCategoryClass(cat)
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[color-mix(in_oklab,var(--border)_15%,transparent)]"
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            );
          })}
        </div>

        {/* Dynamic Category Creator */}
        <div className="flex items-center gap-2 mt-1 max-w-sm">
          <input
            type="text"
            placeholder="Create custom category..."
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomCategory();
              }
            }}
            className="flex-1 h-9 px-3 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted-foreground)]"
          />
          <button
            type="button"
            onClick={handleAddCustomCategory}
            className="h-9 px-3 text-xs font-semibold rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--muted)] hover:border-[var(--border-strong)] transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        </div>
      </div>

      {/* Note Area Redesign */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="note" className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted-foreground)]">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Notes / Context
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          defaultValue={customer?.note ?? ""}
          placeholder="Add important context, interaction history, or specific lead details here..."
          className="w-full px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-sm resize-none transition-all focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 hover:border-[var(--border-strong)] placeholder:text-[var(--muted-foreground)] leading-relaxed"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] border border-[color-mix(in_oklab,var(--danger)_20%,transparent)] rounded-md px-3.5 py-2.5 flex items-start gap-2 animate-slide-up">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  if (standalone) {
    return (
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        {formFieldsContent}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
          <Button type="button" variant="ghost" size="md" onClick={onCancel}>
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
      </form>
    );
  }

  // Raw fields rendering (nested inside parent form in CustomerDetailPanel)
  return formFieldsContent;
}
