import { notFound } from "next/navigation";
import { CivicShell } from "@/components/civic-shell";
import { getEventBundle } from "@/lib/supabase";
import { formatDateTime, maskEmail, maskPhone } from "@/lib/utils";

export default async function ResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await getEventBundle(slug);
  if (!bundle) notFound();

  const winners = bundle.results.filter((result) => result.result_type === "winner");
  const alternates = bundle.results.filter((result) => result.result_type === "alternate");

  return (
    <CivicShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="panel p-6">
          <div className="text-sm font-semibold uppercase tracking-wide text-civic-pine">Public results</div>
          <h1 className="mt-3 text-4xl font-black">{bundle.event.title}</h1>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div>
              <div className="text-sm text-civic-ink/60">Draw date/time</div>
              <div className="font-bold">{formatDateTime(bundle.event.draw_executed_at)}</div>
            </div>
            <div>
              <div className="text-sm text-civic-ink/60">Total valid participants</div>
              <div className="font-bold">{bundle.event.final_participant_count ?? bundle.stats.valid}</div>
            </div>
            <div>
              <div className="text-sm text-civic-ink/60">Verification code</div>
              <div className="break-all font-bold">{bundle.event.verification_hash ?? "Pending lock"}</div>
            </div>
          </div>
        </div>
        <ResultList title="Winners" results={winners} />
        <ResultList title="Alternates" results={alternates} />
      </section>
    </CivicShell>
  );
}

function ResultList({ title, results }: { title: string; results: NonNullable<Awaited<ReturnType<typeof getEventBundle>>>["results"] }) {
  return (
    <div className="panel mt-6 p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-4 grid gap-3">
        {results.length === 0 && <p className="text-civic-ink/70">No {title.toLowerCase()} have been drawn yet.</p>}
        {results.map((result) => (
          <div key={result.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-civic-line p-4">
            <div>
              <div className="font-bold">
                #{result.rank} {result.participant?.full_name}
              </div>
              <div className="text-sm text-civic-ink/65">
                {maskEmail(result.participant?.email ?? "")} - {maskPhone(result.participant?.phone ?? "")}
              </div>
            </div>
            <span className="rounded-md bg-civic-mint px-3 py-2 text-sm font-bold capitalize">{result.result_type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
