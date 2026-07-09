const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const relativeFormatter = new Intl.RelativeTimeFormat("en-US", {
  numeric: "auto",
});

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return dateFormatter.format(d);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return dateTimeFormatter.format(d);
}

export function formatTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return timeFormatter.format(d);
}

export function formatRelative(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  const seconds = (d.getTime() - Date.now()) / 1000;
  const abs = Math.abs(seconds);
  if (abs < 60) return relativeFormatter.format(Math.round(seconds), "second");
  if (abs < 3600) return relativeFormatter.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return relativeFormatter.format(Math.round(seconds / 3600), "hour");
  if (abs < 604800) return relativeFormatter.format(Math.round(seconds / 86400), "day");
  if (abs < 2592000) return relativeFormatter.format(Math.round(seconds / 604800), "week");
  if (abs < 31536000) return relativeFormatter.format(Math.round(seconds / 2592000), "month");
  return relativeFormatter.format(Math.round(seconds / 31536000), "year");
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return currencyFormatter.format(value);
}

export const SERVICE_LABELS: Record<string, string> = {
  ai: "AI Agent",
  website: "Website",
  "ai+website": "AI + Website",
};

export const SERVICE_PRICES: Record<string, number> = {
  ai: 1500,
  website: 2500,
  "ai+website": 3500,
};

export const STATUS_LABELS: Record<string, string> = {
  not_contacted: "Not contacted",
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const ACTIVITY_LABELS: Record<string, string> = {
  created: "Customer created",
  status_changed: "Status changed",
  note_added: "Note added",
  updated: "Details updated",
  deleted: "Customer deleted",
};

export const CATEGORY_LABELS: Record<string, string> = {
  cold_lead: "Cold Lead",
  warm_lead: "Warm Lead",
  hot_lead: "Hot Lead",
  vip: "VIP",
  enterprise: "Enterprise",
};
