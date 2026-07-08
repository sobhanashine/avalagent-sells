"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm({
  signIn,
}: {
  signIn: (fd: FormData) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await signIn(fd);
      if (!res.ok) {
        setError(res.message ?? "Sign in failed");
      }
    } catch (err) {
      if (err && typeof err === "object" && "digest" in err) {
        // redirect from server action — let it propagate
        throw err;
      }
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handle}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 flex flex-col gap-4 shadow-sm"
    >
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="name@avalagent.local"
        required
        autoComplete="email"
      />
      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />
      {error ? (
        <div className="text-sm text-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] border border-[color-mix(in_oklab,var(--danger)_20%,transparent)] rounded-md px-3 py-2">
          {error}
        </div>
      ) : null}
      <Button type="submit" variant="primary" loading={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
