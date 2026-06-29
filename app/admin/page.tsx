import Link from "next/link";
import { Download, FileArchive, Lock, Plus, Shuffle, UsersRound } from "lucide-react";
import { CivicShell } from "@/components/civic-shell";
import { StatCard } from "@/components/stat-card";
import { getEventBundle, isSupabaseConfigured } from "@/lib/supabase";
import { formatDateTime } from "@/lib/utils";

export default async function AdminPage() {
  const bundle = await getEventBundle("world-cup-community-draw");

  return (
    <CivicShell>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-civic-pine">Admin command center</div>
            <h1 className="mt-2 text-4xl font-black">FairDraw operations</h1>
            <p className="mt-2 max-w-2xl text-civic-ink/70">
              Create events, review entries, lock the final participant list, run the draw, and export audit records.
            </p>
          </div>
          <Link className="btn-primary" href="/admin/events/new">
            <Plus size={16} />
            Create event
          </Link>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-lg border border-civic-gold bg-[#fff8e7] p-4 text-sm font-semibold">
            Demo mode is active. Add Supabase environment variables and run `supabase/schema.sql` to persist data.
          </div>
        )}

        {bundle && (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Valid" value={bundle.stats.valid} tone="gold" />
              <StatCard label="Review" value={bundle.stats.review} tone="alert" />
              <StatCard label="Pre-registered" value={bundle.stats.preregistered} />
              <StatCard label="Live" value={bundle.stats.live} />
              <StatCard label="Represented" value={bundle.stats.representative} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="panel overflow-hidden">
                <div className="border-b border-civic-line p-5">
                  <h2 className="text-2xl font-black">{bundle.event.title}</h2>
                  <p className="mt-1 text-sm text-civic-ink/65">
                    Lock: {formatDateTime(bundle.event.locked_at)} | Draw: {formatDateTime(bundle.event.draw_executed_at)}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-civic-paper text-xs uppercase tracking-wide text-civic-ink/60">
                      <tr>
                        <th className="px-4 py-3">Entry</th>
                        <th className="px-4 py-3">Participant</th>
                        <th className="px-4 py-3">Source</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bundle.participants.map((participant) => (
                        <tr key={participant.id} className="border-t border-civic-line">
                          <td className="px-4 py-3 font-bold">{participant.entry_number}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold">{participant.full_name}</div>
                            <div className="text-civic-ink/60">{participant.email}</div>
                          </td>
                          <td className="px-4 py-3">{participant.registration_source.replace("_", " ")}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-md bg-civic-mint px-2 py-1 text-xs font-bold capitalize">
                              {participant.eligibility_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-civic-ink/65">
                            {participant.duplicate_reasons?.join(", ") || "Clear"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-5">
                <AdminActionPanel slug={bundle.event.public_slug} locked={Boolean(bundle.event.locked_at)} />
                <RepresentativeForm slug={bundle.event.public_slug} />
              </div>
            </div>
          </>
        )}
      </section>
    </CivicShell>
  );
}

function AdminActionPanel({ slug, locked }: { slug: string; locked: boolean }) {
  return (
    <div className="panel grid gap-3 p-5">
      <h2 className="text-xl font-black">Event actions</h2>
      <form action={`/api/events/${slug}/lock`} method="post">
        <button className="btn-primary w-full" disabled={locked} type="submit">
          <Lock size={16} />
          Lock participant list
        </button>
      </form>
      <form action={`/api/events/${slug}/draw`} method="post">
        <button className="btn-primary w-full" type="submit">
          <Shuffle size={16} />
          Draw winners
        </button>
      </form>
      <div className="grid grid-cols-2 gap-2">
        <Link className="btn-secondary" href={`/api/events/${slug}/export?type=participants`}>
          <Download size={16} />
          Participants
        </Link>
        <Link className="btn-secondary" href={`/api/events/${slug}/export?type=winners`}>
          <UsersRound size={16} />
          Winners
        </Link>
      </div>
      <Link className="btn-secondary" href={`/api/events/${slug}/audit-report`}>
        <FileArchive size={16} />
        PDF audit report
      </Link>
    </div>
  );
}

function RepresentativeForm({ slug }: { slug: string }) {
  return (
    <form className="panel grid gap-3 p-5" action={`/api/events/${slug}/representative-entry`} method="post">
      <h2 className="text-xl font-black">Representative entry</h2>
      <input className="field" name="full_name" placeholder="Participant full name" required />
      <input className="field" name="email" type="email" placeholder="Participant email" required />
      <input className="field" name="phone" placeholder="Participant phone" required />
      <input className="field" name="city_state" placeholder="Participant city/state" required />
      <input className="field" name="representative_full_name" placeholder="Representative full name" required />
      <input className="field" name="representative_contact" placeholder="Representative email or phone" required />
      <input className="field" name="relationship_to_participant" placeholder="Relationship" required />
      <textarea className="field min-h-24" name="reason_participant_absent" placeholder="Reason participant is not present" required />
      <button className="btn-primary" type="submit">
        Add represented participant
      </button>
    </form>
  );
}
