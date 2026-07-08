import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { describeDbError } from "@/lib/errors";
import type { ServiceType, StatusType } from "@/types/database";

export async function POST(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const instagram = String(formData.get("instagram") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const service = String(formData.get("service") ?? "") as ServiceType;
  const status = (String(formData.get("status") ?? "pending") || "pending") as StatusType;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!instagram || !service) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      instagram_username: instagram,
      phone,
      service,
      status,
      note,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createCustomer api:", describeDbError(error));
    return NextResponse.json(
      { error: error?.message ?? "Insert failed" },
      { status: 500 }
    );
  }

  await supabase.from("activities").insert({
    customer_id: data.id,
    type: "created",
    to_status: status,
  });

  revalidatePath("/");
  revalidatePath("/customers");
  return NextResponse.json({ ok: true, id: data.id });
}
