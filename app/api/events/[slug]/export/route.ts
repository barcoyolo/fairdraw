import { NextRequest, NextResponse } from "next/server";
import { audit, getEventBundle } from "@/lib/supabase";

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await getEventBundle(slug);
  if (!bundle) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const type = request.nextUrl.searchParams.get("type") ?? "participants";
  const rows =
    type === "winners" || type === "alternates"
      ? bundle.results
          .filter((result) => result.result_type === (type === "winners" ? "winner" : "alternate"))
          .map((result) => ({
            rank: result.rank,
            result_type: result.result_type,
            full_name: result.participant?.full_name,
            email: result.participant?.email,
            phone: result.participant?.phone,
            drawn_at: result.drawn_at
          }))
      : bundle.participants
          .filter((participant) => type !== "valid" || participant.eligibility_status === "valid")
          .map((participant) => ({
            entry_number: participant.entry_number,
            full_name: participant.full_name,
            email: participant.email,
            phone: participant.phone,
            city_state: participant.city_state,
            attendance_status: participant.attendance_status,
            registration_source: participant.registration_source,
            eligibility_status: participant.eligibility_status,
            duplicate_reasons: participant.duplicate_reasons?.join("; ")
          }));

  const headers = Object.keys(rows[0] ?? { message: "No records" });
  const csv = [headers.map(csvEscape).join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header as keyof typeof row])).join(","))].join("\n");

  await audit(bundle.event.id, "results_exported", { type });
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${bundle.event.public_slug}-${type}.csv"`
    }
  });
}
