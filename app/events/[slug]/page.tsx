import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarClock, FileText } from "lucide-react";
import { CivicShell } from "@/components/civic-shell";
import { RegistrationForm } from "@/components/registration-form";
import { getEventBundle } from "@/lib/supabase";
import { formatDateTime, registrationWindow } from "@/lib/utils";

export default async function PublicEventPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ source?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const bundle = await getEventBundle(slug);
  if (!bundle) notFound();

  const source = query.source === "live" ? "live" : "preregistration";

  return (
    <CivicShell>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <aside className="space-y-4">
          <div className="panel p-5">
            <div className="text-sm font-semibold uppercase tracking-wide text-civic-pine">{registrationWindow(bundle.event)}</div>
            <h1 className="mt-3 text-3xl font-black">{bundle.event.title}</h1>
            <p className="mt-3 leading-7 text-civic-ink/70">{bundle.event.description}</p>
          </div>
          <div className="panel grid gap-3 p-5">
            <div className="flex gap-3">
              <CalendarClock className="mt-1 text-civic-gold" size={20} />
              <div>
                <div className="font-bold">Registration schedule</div>
                <p className="text-sm leading-6 text-civic-ink/70">
                  Pre-registration closes {formatDateTime(bundle.event.preregistration_closes_at)}.
                  Live registration closes {formatDateTime(bundle.event.live_registration_closes_at)}.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <FileText className="mt-1 text-civic-gold" size={20} />
              <div>
                <div className="font-bold">Eligibility rules</div>
                <p className="text-sm leading-6 text-civic-ink/70">{bundle.event.eligibility_rules}</p>
              </div>
            </div>
          </div>
          <Link className="btn-secondary w-full" href={`/results/${bundle.event.public_slug}`}>
            View public results
          </Link>
        </aside>
        <div>
          <h2 className="mb-4 text-2xl font-bold">{source === "live" ? "Live registration" : "Pre-registration"}</h2>
          <RegistrationForm eventSlug={bundle.event.public_slug} source={source} />
        </div>
      </section>
    </CivicShell>
  );
}
