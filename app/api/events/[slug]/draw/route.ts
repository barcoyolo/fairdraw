import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { audit, getEventBundle, getSupabaseAdmin } from "@/lib/supabase";
import { drawParticipantIds } from "@/lib/utils";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  if (!supabase) redirect("/admin");

  const bundle = await getEventBundle(slug);
  if (!bundle) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (!bundle.event.locked_at) return NextResponse.json({ error: "Lock the participant list before drawing." }, { status: 409 });
  if (bundle.results.length) return NextResponse.json({ error: "Draw has already been executed." }, { status: 409 });

  const validIds = bundle.participants.filter((participant) => participant.eligibility_status === "valid").map((participant) => participant.id);
  const selection = drawParticipantIds(validIds, bundle.event.winner_count, bundle.event.alternate_count);
  const drawnAt = new Date().toISOString();
  const rows = [
    ...selection.winners.map((participantId, index) => ({
      event_id: bundle.event.id,
      participant_id: participantId,
      rank: index + 1,
      result_type: "winner",
      drawn_at: drawnAt
    })),
    ...selection.alternates.map((participantId, index) => ({
      event_id: bundle.event.id,
      participant_id: participantId,
      rank: index + 1,
      result_type: "alternate",
      drawn_at: drawnAt
    }))
  ];

  const { error } = await supabase.from("draw_results").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("events").update({ draw_executed_at: drawnAt }).eq("id", bundle.event.id);
  await audit(bundle.event.id, "draw_executed", {
    winner_count: selection.winners.length,
    alternate_count: selection.alternates.length,
    locked_participant_count: bundle.event.final_participant_count,
    verification_hash: bundle.event.verification_hash
  });

  redirect(`/results/${slug}`);
}
