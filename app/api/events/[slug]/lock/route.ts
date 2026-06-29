import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { audit, getEventBundle, getSupabaseAdmin } from "@/lib/supabase";
import { createVerificationHash } from "@/lib/utils";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  if (!supabase) redirect("/admin");

  const bundle = await getEventBundle(slug);
  if (!bundle) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (bundle.event.locked_at) redirect("/admin");

  const validParticipants = bundle.participants.filter((participant) => participant.eligibility_status === "valid");
  const verificationHash = createVerificationHash(bundle.event, validParticipants);

  const { error } = await supabase
    .from("events")
    .update({
      locked_at: new Date().toISOString(),
      preregistration_open: false,
      live_registration_open: false,
      final_participant_count: validParticipants.length,
      verification_hash: verificationHash
    })
    .eq("id", bundle.event.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(bundle.event.id, "list_locked", { final_participant_count: validParticipants.length, verification_hash: verificationHash });
  redirect("/admin");
}
