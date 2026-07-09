import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCustomers, getCustomer, getCustomerTimeline, getUniqueCategories } from "@/lib/queries";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerFilters } from "@/components/customers/CustomerFilters";
import {
  NewCustomerModal,
  NewCustomerButton,
} from "@/components/customers/NewCustomerModal";
import { CustomerDetailPanel } from "@/components/customers/CustomerDetailPanel";
import { FlashBanner } from "@/components/ui/FlashMessage";
import { SetupRequiredScreen } from "@/components/SetupRequiredScreen";
import type {
  ServiceType,
  StatusType,
} from "@/types/database";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    service?: string;
    category?: string;
    q?: string;
    sort?: string;
    id?: string;
  }>;
}) {
  if (!isSupabaseConfigured()) {
    return <SetupRequiredScreen />;
  }
  const supabase = await createClient();
  if (!supabase) return <SetupRequiredScreen />;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const status = (params.status as StatusType | undefined) ?? "all";
  const service = (params.service as ServiceType | undefined) ?? "all";
  const category = params.category ?? "all";
  const search = params.q?.trim() || undefined;
  const sort = (params.sort as "newest" | "oldest" | undefined) ?? "newest";

  const customers = await getCustomers({ status, service, category, search, sort });
  const uniqueCategories = await getUniqueCategories();

  let detail: { customer: Awaited<ReturnType<typeof getCustomer>>; activities: Awaited<ReturnType<typeof getCustomerTimeline>> } | null = null;
  if (params.id) {
    const customer = await getCustomer(params.id);
    if (customer) {
      const activities = await getCustomerTimeline(params.id);
      detail = { customer, activities };
    }
  }

  const pathname = (await headers()).get("x-pathname") ?? "/customers";
  const totalCount = customers.length;
  const filterCount =
    (status !== "all" ? 1 : 0) +
    (service !== "all" ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <DashboardShell
      pathname={pathname}
      email={user.email ?? "Signed in"}
      rightHeader="Customers"
    >
      <FlashBanner />
      <PageHeader
        title="Customers"
        description={
          filterCount > 0
            ? `${totalCount} ${totalCount === 1 ? "result" : "results"} with ${filterCount} filter${filterCount > 1 ? "s" : ""} applied`
            : `${totalCount} ${totalCount === 1 ? "customer" : "customers"}`
        }
        actions={
          <Link
            href="/"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            ← Overview
          </Link>
        }
      />

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <CustomerFilters categories={uniqueCategories} />
          </div>
          <NewCustomerButton />
        </div>
        <CustomerTable customers={customers} />
      </Card>

      <NewCustomerModal categories={uniqueCategories} />
      {detail?.customer ? (
        <CustomerDetailPanel
          customer={detail.customer}
          activities={detail.activities ?? []}
          uniqueCategories={uniqueCategories}
        />
      ) : null}
    </DashboardShell>
  );
}
