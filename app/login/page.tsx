import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { signIn } from "@/lib/actions/auth";
import { SetupRequiredScreen } from "@/components/SetupRequiredScreen";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return <SetupRequiredScreen />;
  }

  const supabase = await createClient();
  if (!supabase) return <SetupRequiredScreen />;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  // `next` is accepted for future "redirect after login" use, but ignored
  // for now — successful sign-in always lands on the dashboard.
  await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="size-10 rounded-[var(--radius-lg)] bg-[var(--accent)] grid place-items-center text-[var(--accent-foreground)] font-bold">
            A
          </span>
          <h1 className="text-lg font-semibold tracking-tight mt-2">
            AvalAgent Sales
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] text-center max-w-xs">
            Sign in to manage your sales pipeline.
          </p>
        </div>

        <LoginForm signIn={signIn} />
      </div>
    </div>
  );
}
