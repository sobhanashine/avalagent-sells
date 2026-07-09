import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS, SERVICE_LABELS } from "@/lib/format";
import type { StatusType, ServiceType } from "@/types/database";

const statusTones: Record<StatusType, "info" | "warning" | "success" | "danger"> = {
  not_contacted: "info",
  pending: "warning",
  accepted: "success",
  rejected: "danger",
};

const serviceTones: Record<ServiceType, "indigo" | "info" | "violet"> = {
  ai: "indigo",
  website: "info",
  "ai+website": "violet",
};

const badgeTones = ["indigo", "info", "violet", "warning", "danger", "neutral", "success"] as const;

export function StatusBadge({ status }: { status: StatusType }) {
  return (
    <Badge tone={statusTones[status]} dot>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function ServiceBadge({ service }: { service: ServiceType }) {
  return <Badge tone={serviceTones[service]}>{SERVICE_LABELS[service]}</Badge>;
}

export function CategoryBadge({ category }: { category: string | null | undefined }) {
  if (!category) return null;

  // Simple string hash function to choose a stable, consistent color tone
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const tone = badgeTones[Math.abs(hash) % badgeTones.length];

  // Clean formatting: e.g. "cold_lead" -> "Cold Lead", "vip" -> "VIP"
  let label = category
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Special abbreviation formats
  if (label.toLowerCase() === "vip") {
    label = "VIP";
  }

  return <Badge tone={tone}>{label}</Badge>;
}
