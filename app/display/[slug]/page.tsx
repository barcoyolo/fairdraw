import { Lock, Unlock } from "lucide-react";
import { QrCode } from "@/components/qr-code";
import { StatCard } from "@/components/stat-card";
import { getEventBundle } from "@/lib/supabase";
import { formatDateTime, maskEmail, maskPhone, registrationWindow } from "@/lib/utils";

export const revalidate = 5;

export default async function DisplayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await getEventBundle(slug);
  if (!bundle) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const registrationUrl = `${siteUrl}/events/${bundle.event.public_slug}?source=live`;
  const winners = bundle.results.filter((result) => result.result_type === "winner");

  return (
    <main className="min-h-screen bg-civic-ink text-white">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-white/12 px-3 py-2 text-sm font-bold uppercase tracking-wide">
              {registrationWindow(bundle.event)}
            </span>
            <span className="rounded-md bg-white/12 px-3 py-2 text-sm font-bold">
              Closes {formatDateTime(bundle.event.live_registration_closes_at)}
            </span>
          </div>
          <h1 className="mt-6 max-w-5xl text-5xl font-black leading-tight sm:text-7xl">{bundle.event.title}</h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Pre-registered" value={bundle.stats.preregistered} />
            <StatCard label="Live participants" value={bundle.stats.live} />
            <StatCard label="Representative entries" value={bundle.stats.representative} />
            <StatCard label="Valid entries" value={bundle.stats.valid} tone="gold" />
            <StatCard label="Duplicate or review" value={bundle.stats.review} tone="alert" />
            <StatCard label="Rejected" value={bundle.stats.rejected} />
          </div>
          <div className="mt-8 rounded-lg border border-white/16 bg-white/8 p-5">
            <div className="flex items-center gap-3 text-xl font-bold">
              {bundle.event.locked_at ? <Lock /> : <Unlock />}
              {bundle.event.locked_at ? "Participant list locked" : "Participant list not locked"}
            </div>
            <p className="mt-2 text-white/72">
              Verification code: {bundle.event.verification_hash ?? "Generated when the list is locked"}
            </p>
          </div>
          {winners.length > 0 && (
            <div className="mt-8 rounded-lg bg-white p-5 text-civic-ink">
              <h2 className="text-2xl font-black">Winners</h2>
              <div className="mt-4 grid gap-3">
                {winners.map((result) => (
                  <div key={result.id} className="rounded-md border border-civic-line p-3 font-semibold">
                    #{result.rank} {result.participant?.full_name} - {maskEmail(result.participant?.email ?? "")} -{" "}
                    {maskPhone(result.participant?.phone ?? "")}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <aside className="rounded-lg bg-civic-paper p-5 text-civic-ink">
          <QrCode value={registrationUrl} />
          <div className="mt-5 text-center">
            <div className="text-lg font-black">Scan to enter live</div>
            <a className="mt-3 block break-all text-sm text-civic-pine" href={registrationUrl}>
              {registrationUrl}
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
