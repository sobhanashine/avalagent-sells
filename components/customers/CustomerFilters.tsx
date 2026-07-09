"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SERVICE_LABELS, STATUS_LABELS, CATEGORY_LABELS } from "@/lib/format";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const STATUSES = ["all", "not_contacted", "pending", "accepted", "rejected"] as const;
const SERVICES = ["all", "ai", "website", "ai+website"] as const;
const CATEGORIES = ["all", "none", "cold_lead", "warm_lead", "hot_lead", "vip", "enterprise"] as const;
const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
] as const;

export function CustomerFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = React.useState(params.get("q") ?? "");

  const commit = React.useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "" || value === "all") next.delete(key);
      else next.set(key, value);
      next.delete("id"); // close any open detail panel when filters change
      const qs = next.toString();
      router.push(qs ? `?${qs}` : "?");
    },
    [params, router]
  );

  // Debounced search input — keeps the URL in sync without spamming history.
  React.useEffect(() => {
    const currentQ = params.get("q") ?? "";
    if (search.trim() === currentQ.trim()) return;

    const t = setTimeout(() => {
      commit("q", search.trim() ? search.trim() : null);
    }, 200);
    return () => clearTimeout(t);
  }, [search, commit, params]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[180px]">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <Input
          name="q-input"
          placeholder="Search instagram, phone, or note…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
          label=""
        />
      </div>
      <Select
        name="status"
        value={params.get("status") ?? "all"}
        onChange={(e) => commit("status", e.target.value)}
        label=""
        className="w-[140px]"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s === "all" ? "All statuses" : STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      <Select
        name="service"
        value={params.get("service") ?? "all"}
        onChange={(e) => commit("service", e.target.value)}
        label=""
        className="w-[150px]"
      >
        {SERVICES.map((s) => (
          <option key={s} value={s}>
            {s === "all" ? "All services" : SERVICE_LABELS[s]}
          </option>
        ))}
      </Select>
      <Select
        name="category"
        value={params.get("category") ?? "all"}
        onChange={(e) => commit("category", e.target.value)}
        label=""
        className="w-[150px]"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c === "all" ? "All categories" : c === "none" ? "No category" : CATEGORY_LABELS[c]}
          </option>
        ))}
      </Select>
      <Select
        name="sort"
        value={params.get("sort") ?? "newest"}
        onChange={(e) => commit("sort", e.target.value === "newest" ? null : e.target.value)}
        label=""
        className="w-[140px]"
      >
        {SORTS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
