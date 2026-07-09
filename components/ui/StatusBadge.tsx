import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS, SERVICE_LABELS, CATEGORY_LABELS } from "@/lib/format";
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

const categoryTones: Record<string, "neutral" | "warning" | "danger" | "violet" | "success"> = {
  cold_lead: "neutral",
  warm_lead: "warning",
  hot_lead: "danger",
  vip: "violet",
  enterprise: "success",
};

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
  if (!category || !CATEGORY_LABELS[category]) return null;
  return <Badge tone={categoryTones[category] ?? "neutral"}>{CATEGORY_LABELS[category]}</Badge>;
}
