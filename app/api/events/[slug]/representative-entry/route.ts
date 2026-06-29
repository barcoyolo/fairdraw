import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { audit, getEventBundle, getSupabaseAdmin } from "@/lib/supabase";
import { detectDuplicateReasons } from "@/lib/utils";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const supabase = getSupabaseAdmin();
  const { slug } = await params;
  if (!supabase) redirect("/admin");

  const bundle = await getEventBundle(slug);
  if (!bundle) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (bundle.event.locked_at) return NextResponse.json({ error: "Registration is locked." }, { status: 423 });

  const form = await request.formData();
  const contact = String(form.get("representative_contact"));
  const { data: representative, error: representativeError } = await supabase
    .from("representatives")
    .insert({
      full_name: String(form.get("representative_full_name")),
      email: contact.includes("@") ? contact : null,
      phone: contact.includes("@") ? null : contact,
      relationship_to_participant: String(form.get("relationship_to_participant")),
      reason_participant_absent: String(form.get("reason_participant_absent"))
    })
    .select("*")
    .single();

  if (representativeError) return NextResponse.json({ error: representativeError.message }, { status: 400 });

  const candidate = {
    full_name: String(form.get("full_name")),
    email: String(form.get("email")),
    phone: String(form.get("phone")),
    representative_id: representative.id
  };
  const reasons = detectDuplicateReasons(candidate, bundle.participants);
  const nextEntryNumber = (bundle.participants.at(-1)?.entry_number ?? 1000) + 1;
  const { data: participant, error } = await supabase
    .from("participants")
    .insert({
      event_id: bundle.event.id,
      entry_number: nextEntryNumber,
      full_name: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone,
      city_state: String(form.get("city_state")),
      attendance_status: "no",
      registration_source: "representative_entry",
      representative_id: representative.id,
      eligibility_status: reasons.length ? "pending" : "valid",
      duplicate_reasons: reasons
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(bundle.event.id, "representative_entry_added", {
    participant_id: participant.id,
    representative_id: representative.id,
    duplicate_reasons: reasons
  });

  redirect("/admin");
}
