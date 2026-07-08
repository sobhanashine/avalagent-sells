"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { describeDbError } from "@/lib/errors";
import type { CustomerUpdate, StatusType } from "@/types/database";

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { ok: false as const, message: "Database not configured" };

  const update: CustomerUpdate = {};
  const fields: (keyof CustomerUpdate)[] = [
    "instagram_username",
    "phone",
    "service",
    "status",
    "note",
  ];
  for (const field of fields) {
    const raw = formData.get(field);
    if (raw === null) continue;
    if (field === "phone" || field === "note") {
      (update as Record<string, unknown>)[field] = String(raw).trim() || null;
    } else {
      (update as Record<string, unknown>)[field] = String(raw).trim();
    }
  }

  const { data: existing, error: fetchErr } = await supabase
    .from("customers")
    .select("status, instagram_username, note")
    .eq("id", id)
    .single();

  if (fetchErr || !existing) {
    return { ok: false as const, message: "Customer not found" };
  }

  const { error } = await supabase
    .from("customers")
    .update(update)
    .eq("id", id);

  if (error) {
    console.error("updateCustomer:", describeDbError(error));
    return { ok: false as const, message: "Update failed" };
  }

  const activities: Array<{
    type: "status_changed" | "note_added" | "updated";
    from_status?: StatusType | null;
    to_status?: StatusType | null;
    message?: string | null;
  }> = [];

  if (update.status && update.status !== existing.status) {
    activities.push({
      type: "status_changed",
      from_status: existing.status,
      to_status: update.status,
    });
  }
  const prevNote = formData.get("prev_note");
  if (
    update.note !== undefined &&
    update.note &&
    update.note !== (typeof prevNote === "string" ? prevNote : null)
  ) {
    activities.push({ type: "note_added", message: update.note });
  }
  if (
    !activities.length &&
    (update.instagram_username || update.phone || update.service)
  ) {
    activities.push({ type: "updated" });
  }

  if (activities.length) {
    const { error: actErr } = await supabase.from("activities").insert(
      activities.map((a) => ({ customer_id: id, ...a }))
    );
    if (actErr)
      console.error("updateCustomer activities:", describeDbError(actErr));
  }

  revalidatePath("/");
  revalidatePath("/customers");
  return { ok: true as const };
}

export async function setCustomerStatus(id: string, status: StatusType) {
  const supabase = await createClient();
  if (!supabase) return { ok: false as const, message: "Database not configured" };

  const { data: existing } = await supabase
    .from("customers")
    .select("status")
    .eq("id", id)
    .single();

  if (!existing || existing.status === status) {
    return { ok: true as const };
  }

  const { error } = await supabase
    .from("customers")
    .update({ status })
    .eq("id", id);

  if (error) return { ok: false as const, message: "Update failed" };

  const { error: actErr } = await supabase.from("activities").insert({
    customer_id: id,
    type: "status_changed",
    from_status: existing.status,
    to_status: status,
  });
  if (actErr)
    console.error("setCustomerStatus activity:", describeDbError(actErr));

  revalidatePath("/");
  revalidatePath("/customers");
  return { ok: true as const };
}

export async function bulkSetCustomerStatus(ids: string[], status: StatusType) {
  const supabase = await createClient();
  if (!supabase) return { ok: false as const, message: "Database not configured" };
  if (!ids.length) return { ok: true as const, count: 0 };

  const { data: existing } = await supabase
    .from("customers")
    .select("id, status")
    .in("id", ids);

  const changing =
    existing?.filter((c) => c.status !== status).map((c) => c.id) ?? [];
  if (!changing.length) return { ok: true as const, count: 0 };

  const { error } = await supabase
    .from("customers")
    .update({ status })
    .in("id", changing);

  if (error) return { ok: false as const, message: "Bulk update failed" };

  await supabase.from("activities").insert(
    changing.map((id) => ({
      customer_id: id,
      type: "status_changed" as const,
      to_status: status,
    }))
  );

  revalidatePath("/");
  revalidatePath("/customers");
  return { ok: true as const, count: changing.length };
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  if (!supabase) return { ok: false as const };
  await supabase.from("customers").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/customers");
  return { ok: true as const };
}

export async function bulkDeleteCustomers(ids: string[]) {
  const supabase = await createClient();
  if (!supabase || !ids.length) return { ok: true as const, count: 0 };
  await supabase.from("customers").delete().in("id", ids);
  revalidatePath("/");
  revalidatePath("/customers");
  return { ok: true as const, count: ids.length };
}
