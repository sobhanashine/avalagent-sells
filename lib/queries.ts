import { createClient } from "@/lib/supabase/server";
import { SERVICE_PRICES } from "@/lib/format";
import { describeDbError } from "@/lib/errors";
import type {
  Customer,
  ServiceType,
  StatusType,
  Activity,
} from "@/types/database";

export interface DashboardStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  notContacted: number;
  conversionRate: number;
  pipelineValue: number;
  realizedRevenue: number;
  serviceBreakdown: Array<{
    service: ServiceType;
    count: number;
    revenue: number;
  }>;
  recent: Customer[];
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // Don't double-log: the throw below propagates into Next.js's dev
    // overlay with the same message, and the page renders it in the
    // empty state. A second console.error would just create noise.
    throw new Error(describeDbError(error));
  }

  const all = customers ?? [];
  const pending = all.filter((c) => c.status === "pending").length;
  const accepted = all.filter((c) => c.status === "accepted").length;
  const rejected = all.filter((c) => c.status === "rejected").length;
  const notContacted = all.filter((c) => c.status === "not_contacted").length;

  const services: ServiceType[] = ["ai", "website", "ai+website"];
  const serviceBreakdown = services.map((service) => {
    const ofService = all.filter((c) => c.service === service);
    const revenue =
      service === "ai"
        ? ofService.length * SERVICE_PRICES.ai
        : service === "website"
        ? ofService.length * SERVICE_PRICES.website
        : ofService.length * SERVICE_PRICES["ai+website"];
    return { service, count: ofService.length, revenue };
  });

  const total = all.length;
  const decided = accepted + rejected;
  const conversionRate = decided > 0 ? (accepted / decided) * 100 : 0;

  const pipelineValue = all
    .filter((c) => c.status === "pending")
    .reduce(
      (sum, c) => sum + (SERVICE_PRICES[c.service] ?? 0),
      0
    );
  const realizedRevenue = all
    .filter((c) => c.status === "accepted")
    .reduce(
      (sum, c) => sum + (SERVICE_PRICES[c.service] ?? 0),
      0
    );

  return {
    total,
    pending,
    accepted,
    rejected,
    notContacted,
    conversionRate,
    pipelineValue,
    realizedRevenue,
    serviceBreakdown,
    recent: all.slice(0, 6),
  };
}

export interface CustomerFilters {
  status?: StatusType | "all";
  service?: ServiceType | "all";
  category?: string | "all";
  search?: string;
  sort?: "newest" | "oldest";
}

export async function getCustomers(
  filters: CustomerFilters
): Promise<Customer[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase.from("customers").select("*");

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.service && filters.service !== "all") {
    query = query.eq("service", filters.service);
  }
  if (filters.category && filters.category !== "all") {
    if (filters.category === "none") {
      query = query.is("category", null);
    } else {
      query = query.eq("category", filters.category);
    }
  }
  if (filters.search) {
    const term = filters.search.replace(/[%_]/g, (s) => "\\" + s);
    query = query.or(
      `instagram_username.ilike.%${term}%,phone.ilike.%${term}%,note.ilike.%${term}%,category.ilike.%${term}%`
    );
  }

  const ascending = filters.sort === "oldest";
  query = query.order("created_at", { ascending });

  const { data, error } = await query;
  if (error) {
    console.error("getCustomers:", describeDbError(error));
    return [];
  }
  return data ?? [];
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getCustomer:", describeDbError(error));
    return null;
  }
  return data ?? null;
}

export async function getCustomerTimeline(
  customerId: string
): Promise<Activity[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getCustomerTimeline:", describeDbError(error));
    return [];
  }
  return (data ?? []) as Activity[];
}
