/**
 * Extract a readable string from any Supabase/PostgrestError.
 *
 * PostgrestError exposes its `message`, `code`, `details`, and `hint` as
 * non-enumerable properties, so `console.error(err)` and React's error
 * rendering collapse them to `{}` in DevTools. This helper pulls the
 * fields out and adds a hint for the two most common setup mistakes:
 *
 *   - 42P01 (relation does not exist)  → schema.sql was not run
 *   - 42501 (permission denied)        → RLS policies are blocking
 *
 * Used by lib/queries.ts, lib/actions/customers.ts, and the
 * app/api/customers route handler — every server module that talks to
 * Supabase, so a single error log line is always actionable.
 */
export function describeDbError(err: unknown): string {
  if (!err || typeof err !== "object") return "Unknown database error";
  const e = err as {
    message?: unknown;
    code?: unknown;
    details?: unknown;
    hint?: unknown;
  };
  const message = typeof e.message === "string" ? e.message : "";
  const code = typeof e.code === "string" ? e.code : "";
  const details = typeof e.details === "string" ? e.details : "";
  const hint = typeof e.hint === "string" ? e.hint : "";

  if (code === "42P01" || /does not exist/i.test(message)) {
    return `${message || "Table not found"} (code ${code || "42P01"}). Run supabase/schema.sql in the Supabase SQL editor — the customers/activities tables are missing → https://supabase.com/dashboard → SQL Editor.`;
  }
  if (code === "42501" || /permission denied/i.test(message)) {
    return `${message} (code ${code || "42501"}). Row-level security is blocking the query — re-run supabase/schema.sql so its policies are created.`;
  }

  return [
    message || "(no message)",
    code ? `code ${code}` : "",
    details ? `details: ${details}` : "",
    hint ? `hint: ${hint}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
