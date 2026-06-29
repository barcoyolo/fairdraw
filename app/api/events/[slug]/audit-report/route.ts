import { NextResponse } from "next/server";
import { audit, getEventBundle } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";

function pdfText(lines: string[]) {
  const escaped = lines.map((line) => line.replace(/[()\\]/g, "\\$&"));
  const content = escaped.map((line, index) => `BT /F1 11 Tf 54 ${750 - index * 18} Td (${line}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`
  ];
  let offset = "%PDF-1.4\n".length;
  const xref = ["0000000000 65535 f "];
  const body = objects
    .map((object) => {
      xref.push(String(offset).padStart(10, "0") + " 00000 n ");
      offset += object.length + 1;
      return object;
    })
    .join("\n");
  const trailerOffset = offset;
  return `%PDF-1.4\n${body}\nxref\n0 ${xref.length}\n${xref.join("\n")}\ntrailer << /Size ${xref.length} /Root 1 0 R >>\nstartxref\n${trailerOffset}\n%%EOF`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await getEventBundle(slug);
  if (!bundle) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const winners = bundle.results.filter((result) => result.result_type === "winner");
  const alternates = bundle.results.filter((result) => result.result_type === "alternate");
  const lines = [
    "FairDraw Community Lottery Audit Report",
    `Event name: ${bundle.event.title}`,
    `Date/time: ${formatDateTime(new Date().toISOString())}`,
    `Number of winners: ${bundle.event.winner_count}`,
    `Number of alternates: ${bundle.event.alternate_count}`,
    `Total pre-registered entries: ${bundle.stats.preregistered}`,
    `Total live entries: ${bundle.stats.live}`,
    `Total representative entries: ${bundle.stats.representative}`,
    `Total rejected/duplicate entries: ${bundle.stats.review + bundle.stats.rejected}`,
    `Final valid participant count: ${bundle.event.final_participant_count ?? bundle.stats.valid}`,
    `Verification code/hash: ${bundle.event.verification_hash ?? "Pending"}`,
    `Admin who ran the draw: ${bundle.event.draw_admin_id ?? "Not recorded"}`,
    `Timestamp of draw: ${formatDateTime(bundle.event.draw_executed_at)}`,
    "Winner list:",
    ...winners.map((result) => `  ${result.rank}. ${result.participant?.full_name ?? "Unknown"}`),
    "Alternate list:",
    ...alternates.map((result) => `  ${result.rank}. ${result.participant?.full_name ?? "Unknown"}`)
  ];

  await audit(bundle.event.id, "audit_report_exported", {});
  return new NextResponse(pdfText(lines), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${bundle.event.public_slug}-audit-report.pdf"`
    }
  });
}
