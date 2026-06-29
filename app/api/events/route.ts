import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { audit, getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const form = await request.formData();
  const payload = {
    title: String(form.get("title")),
    description: String(form.get("description")),
    winner_count: Number(form.get("winner_count")),
    alternate_count: Number(form.get("alternate_count")),
    preregistration_opens_at: new Date(String(form.get("preregistration_opens_at"))).toISOString(),
    preregistration_closes_at: new Date(String(form.get("preregistration_closes_at"))).toISOString(),
    live_registration_closes_at: new Date(String(form.get("live_registration_closes_at"))).toISOString(),
    eligibility_rules: String(form.get("eligibility_rules")),
    public_slug: String(form.get("public_slug")).trim().toLowerCase(),
    preregistration_open: true,
    live_registration_open: false
  };

  const { data, error } = await supabase.from("events").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await audit(data.id, "event_created", { title: data.title });
  redirect("/admin");
}
