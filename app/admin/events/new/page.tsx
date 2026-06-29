import { CivicShell } from "@/components/civic-shell";

export default function NewEventPage() {
  return (
    <CivicShell>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <form className="panel grid gap-4 p-6" action="/api/events" method="post">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-civic-pine">Create event</div>
            <h1 className="mt-2 text-3xl font-black">New community lottery</h1>
          </div>
          <input className="field" name="title" placeholder="Event title" required />
          <textarea className="field min-h-28" name="description" placeholder="Event description" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="field" name="winner_count" type="number" min="1" placeholder="Number of winners" required />
            <input className="field" name="alternate_count" type="number" min="0" placeholder="Number of alternates" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2">
              <span className="label">Pre-registration opens</span>
              <input className="field" name="preregistration_opens_at" type="datetime-local" required />
            </label>
            <label className="grid gap-2">
              <span className="label">Pre-registration closes</span>
              <input className="field" name="preregistration_closes_at" type="datetime-local" required />
            </label>
            <label className="grid gap-2">
              <span className="label">Live registration closes</span>
              <input className="field" name="live_registration_closes_at" type="datetime-local" required />
            </label>
          </div>
          <textarea className="field min-h-24" name="eligibility_rules" placeholder="Eligibility rules" required />
          <input className="field" name="public_slug" placeholder="public-slug" required />
          <button className="btn-primary" type="submit">Create event</button>
        </form>
      </section>
    </CivicShell>
  );
}
