"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  ok: boolean;
  message?: string;
}

/**
 * The ONLY accounts this dashboard accepts. They are created by
 * `npm run seed` (scripts/seed-users.mjs), which uses the Supabase
 * admin API to provision them with a known password and email_confirm.
 * Self–sign-up through the UI is not exposed.
 */
const ALLOWED_EMAILS = new Set([
  "sobhan@avalagent.local",
  "milad@avalagent.local",
]);

export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, message: "Authentication not configured" };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Email and password are required" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };

  redirect("/");
}

/**
 * Defense in depth — the login UI no longer exposes a sign-up tab, but even
 * if a malicious client POSTs directly to this action the only sign-ups it
 * will accept are the two pre-provisioned operator emails.
 */
export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) {
    return { ok: false, message: "Sign-up is closed." };
  }

  const password = String(formData.get("password") ?? "");
  if (password.length < 6) {
    return { ok: false, message: "Password must be at least 6 characters" };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, message: "Authentication not configured" };
  }

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, message: error.message };

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
