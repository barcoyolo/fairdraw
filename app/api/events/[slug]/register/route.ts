import { NextRequest, NextResponse } from "next/server";
import { audit, getEventBundle, getSupabaseAdmin } from "@/lib/supabase";
import { detectDuplicateReasons } from "@/lib/utils";
import type { RegistrationSource } from "@/lib/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const supabase = getSupabaseAdmin();
  const { slug } = await params;
  const body = await request.json();

  if (!body.consent) return NextResponse.json({ error: "Consent is required." }, { status: 400 });
  if (!supabase) {
    return NextResponse.json({ entry_number: Math.floor(1000 + Math.random() * 9000), demo: true });
  }

  const bundle = await getEventBundle(slug);
  if (!bundle) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (bundle.event.locked_at) return NextResponse.json({ error: "Registration is locked." }, { status: 423 });

  const source = body.registration_source as RegistrationSource;
  if (source === "preregistration" && !bundle.event.preregistration_open) {
    return NextResponse.json({ error: "Pre-registration is closed." }, { status: 403 });
  }
  if (source === "live" && !bundle.event.live_registration_open) {
    return NextResponse.json({ error: "Live registration is closed." }, { status: 403 });
  }

  const reasons = detectDuplicateReasons({ ...body, representative_id: null }, bundle.participants);
  const nextEntryNumber = (bundle.participants.at(-1)?.entry_number ?? 1000) + 1;
  const { data, error } = await supabase
    .from("participants")
    .insert({
      event_id: bundle.event.id,
      entry_number: nextEntryNumber,
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      city_state: body.city_state,
      attendance_status: body.attendance_status,
      registration_source: source,
      eligibility_status: reasons.length ? "pending" : "valid",
      duplicate_reasons: reasons
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(bundle.event.id, "participant_registered", { participant_id: data.id, source, duplicate_reasons: reasons });

  return NextResponse.json({ entry_number: data.entry_number });
}
