import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getDashboardStats, type DashboardStats } from "@/lib/queries";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { ServiceDonut } from "@/components/dashboard/ServiceDonut";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { RecentCustomers } from "@/components/dashboard/RecentCustomers";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/format";
import { FlashBanner } from "@/components/ui/FlashMessage";
import { SetupRequiredScreen } from "@/components/SetupRequiredScreen";
import { Users, TrendingUp, Plus } from "lucide-react";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return <SetupRequiredScreen />;
  }

  const supabase = await createClient();
  if (!supabase) return <SetupRequiredScreen />;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // getDashboardStats throws a human-readable Error on Supabase failures.
  // We catch so the page can render an actionable message instead of
  // crashing the whole dashboard.
  let stats: DashboardStats | null = null;
  let loadError: string | null = null;
  try {
    stats = await getDashboardStats();
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err);
  }
  const pathname = (await headers()).get("x-pathname") ?? "/";

  return (
    <DashboardShell
      pathname={pathname}
      email={user.email ?? "Signed in"}
      rightHeader="Overview"
    >
      <FlashBanner />
      <PageHeader
        title={`Welcome back, ${(user.email ?? "you").split("@")[0]}`}
        description="Here's how your pipeline looks today."
        actions={
          <Link
            href="/customers?new=1"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Add customer
          </Link>
        }
      />

      {loadError || !stats ? (
        <EmptyState
          icon={<span className="text-2xl">⚠</span>}
          title="Could not load your data"
          description={
            loadError ??
            "Check your Supabase configuration and try again."
          }
          action={
            <Link
              href="/customers"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--muted)] text-sm font-medium hover:bg-[var(--muted)]/70 transition-colors"
            >
              Try the customers page →
            </Link>
          }
        />
      ) : stats.total === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Users size={20} />}
              title="Start by adding your first customer"
              description="Track leads, accept deals, and watch your pipeline fill in real time."
              action={
                <Link
                  href="/customers?new=1"
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus size={14} />
                  Add customer
                </Link>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Total customers"
              value={stats.total}
              intent="neutral"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              intent="warning"
              sublabel={`${formatCurrency(stats.pipelineValue)} in pipeline`}
            />
            <StatCard
              label="Accepted"
              value={stats.accepted}
              intent="success"
              sublabel={`${formatCurrency(stats.realizedRevenue)} realized`}
            />
            <StatCard
              label="Conversion"
              value={`${stats.conversionRate.toFixed(0)}%`}
              intent="info"
              sublabel={`${stats.accepted} of ${stats.accepted + stats.rejected} decided`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Customers by service</CardTitle>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Distribution across all leads
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/customers">View all</Link>
                </Button>
              </CardHeader>
              <CardBody>
                <ServiceDonut data={stats.serviceBreakdown} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Pipeline funnel</CardTitle>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Where leads stand today
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <ConversionFunnel
                  counts={{
                    pending: stats.pending,
                    accepted: stats.accepted,
                    rejected: stats.rejected,
                  }}
                />
                <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <TrendingUp size={12} />
                    Realized revenue
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(stats.realizedRevenue)}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card className="mt-3">
            <CardHeader>
              <div>
                <CardTitle>Recent customers</CardTitle>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Last {Math.min(stats.recent.length, 6)} leads
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/customers">Open customers</Link>
              </Button>
            </CardHeader>
            <RecentCustomers customers={stats.recent} />
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
