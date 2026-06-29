import { NextRequest, NextResponse } from "next/server";
import { audit, getEventBundle, getSupabaseAdmin } from "@/lib/supabase";
import type { EligibilityStatus } from "@/lib/types";

const allowed = new Set(["valid", "duplicate", "rejected", "pending"]);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string; participantId: string }> }) {
  const { slug, participantId } = await params;
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const bundle = await getEventBundle(slug);
  if (!bundle) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (bundle.event.locked_at) return NextResponse.json({ error: "Participant list is locked." }, { status: 423 });

  const { status } = (await request.json()) as { status: EligibilityStatus };
  if (!allowed.has(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  const { error } = await supabase
    .from("participants")
    .update({ eligibility_status: status, updated_at: new Date().toISOString() })
    .eq("id", participantId)
    .eq("event_id", bundle.event.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await audit(bundle.event.id, "duplicate_marked", { participant_id: participantId, status });
  return NextResponse.json({ ok: true });
}
