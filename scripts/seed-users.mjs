#!/usr/bin/env node
/**
 * Seed the two authorized operator accounts.
 *
 * Run once after `supabase/schema.sql` has been applied and after
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are in
 * .env.local:
 *
 *   npm run seed
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local. Find it in
 * Supabase Dashboard → Project Settings → API → service_role (secret).
 *
 * The script is idempotent — re-running updates passwords to match
 * the values below without creating duplicate users.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Tiny .env loader so `npm run seed` Just Works without dotenv.
function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL is missing from .env.local");
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing from .env.local");
  console.error(
    "   Get it from: Supabase Dashboard → Project Settings → API → service_role (secret)."
  );
  console.error("   ⚠️  Never expose this key publicly or commit it.");
  process.exit(1);
}

// The ONLY accounts this dashboard accepts. Change here to rotate credentials.
const USERS = [
  {
    email: "sobhan@avalagent.local",
    password: "Sobhan123456",
    full_name: "Sobhan",
  },
  {
    email: "milad@avalagent.local",
    password: "Milad123456",
    full_name: "Milad",
  },
];

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureUser({ email, password, full_name }) {
  // 1) Look for an existing user with this email.
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw listErr;
  const existing = (list?.users ?? []).find(
    (u) => (u.email ?? "").toLowerCase() === email.toLowerCase()
  );

  if (existing) {
    // Update password + metadata so this script reflects current policy.
    const { error: updErr } = await admin.auth.admin.updateUserById(
      existing.id,
      {
        password,
        email_confirm: true,
        user_metadata: {
          ...(existing.user_metadata ?? {}),
          full_name,
        },
      }
    );
    if (updErr) throw updErr;
    return { status: "updated", id: existing.id };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (error) throw error;
  return { status: "created", id: data.user?.id };
}

(async () => {
  console.log("🔐 Seeding operator accounts…\n");
  let ok = 0;
  let fail = 0;
  for (const u of USERS) {
    try {
      const r = await ensureUser(u);
      const tag = r.status === "created" ? "🆕 created" : "🔁 updated";
      console.log(`  ${tag}  ${u.email}  (id: ${r.id})`);
      ok++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ ${u.email}  → ${msg}`);
      fail++;
    }
  }
  console.log(
    `\nDone. ${ok} succeeded${fail ? `, ${fail} failed` : ""}.`
  );
  console.log("\nYou can now sign in at /login with these credentials:");
  for (const u of USERS) {
    console.log(`  • ${u.email}  /  ${u.password}`);
  }
  if (fail) process.exit(1);
})();
