"use client";

import Link from "next/link";

export function SetupRequiredScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--background)]">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <span className="size-9 rounded-[var(--radius-md)] bg-[var(--accent)] grid place-items-center text-[var(--accent-foreground)] font-bold text-sm">
            A
          </span>
          <span className="font-semibold tracking-tight">AvalAgent Sales</span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[color-mix(in_oklab,var(--warning)_15%,transparent)] text-[var(--warning)] border border-[color-mix(in_oklab,var(--warning)_30%,transparent)]">
              Setup required
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              ~5 minutes
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Connect your database to get started
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-prose">
            AvalAgent Sales stores customer data in{" "}
            <Link
              href="https://supabase.com"
              target="_blank"
              className="text-[var(--accent)] hover:underline font-medium"
            >
              Supabase
            </Link>{" "}
            so it syncs across all your devices. Create a free project, paste
            your keys into{" "}
            <code className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-xs">.env.local</code>
            , then run the SQL below once in the Supabase SQL editor.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <SetupStep
              number={1}
              title="Create a project"
              body={
                <>
                  Head to{" "}
                  <Link
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    className="text-[var(--accent)] hover:underline"
                  >
                    supabase.com/dashboard
                  </Link>{" "}
                  → New project. Copy the <strong>Project URL</strong> and{" "}
                  <strong>anon public</strong> key from{" "}
                  <em>Project Settings → API</em>.
                </>
              }
            />
            <SetupStep
              number={2}
              title="Add credentials"
              body={
                <>
                  Create a{" "}
                  <code className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-xs">
                    .env.local
                  </code>{" "}
                  file in your project root with:
                  <pre className="mt-2 px-3 py-2 rounded-md bg-[var(--muted)] text-xs font-[family-name:var(--font-geist-mono)] overflow-x-auto whitespace-pre">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
                  </pre>
                </>
              }
            />
            <SetupStep
              number={3}
              title="Run the migration"
              body={
                <>
                  In the Supabase SQL editor, paste and run the contents of{" "}
                  <code className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-xs">
                    supabase/schema.sql
                  </code>{" "}
                  from this repository. Then refresh this page.
                </>
              }
            />
            <SetupStep
              number={4}
              title="Create your admin account"
              body={
                <>
                  Once connected, you&apos;ll land on the login screen. Click{" "}
                  <em>Create an account</em> to make your admin user — that&apos;s it.
                </>
              }
            />
          </div>

          <div className="mt-7 pt-5 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-[var(--muted-foreground)]">
              Stuck? Check the project&apos;s README for copy-paste-ready SQL.
            </p>
            <button
              type="button"
              onClick={() => location.reload()}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              I&apos;ve set it up — refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupStep({
  number,
  title,
  body,
}: {
  number: number;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="size-7 rounded-full bg-[var(--muted)] grid place-items-center text-xs font-semibold shrink-0">
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-sm text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
          {body}
        </div>
      </div>
    </div>
  );
}
