import Link from "next/link";
import { ArrowRight, FileCheck2, MonitorUp, ShieldCheck } from "lucide-react";
import { CivicShell } from "@/components/civic-shell";

export default function HomePage() {
  return (
    <CivicShell>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-civic-line bg-white px-3 py-2 text-sm font-semibold text-civic-pine">
            <ShieldCheck size={16} />
            Publicly verifiable community drawings
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-civic-ink sm:text-6xl">
            FairDraw Community Lottery
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-civic-ink/72">
            A transparent lottery system for embassy and community giveaways with pre-registration,
            live QR entry, representative entry, duplicate review, locked lists, secure draws, and audit reporting.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/events/world-cup-community-draw">
              Open public registration
              <ArrowRight size={16} />
            </Link>
            <Link className="btn-secondary" href="/admin">
              Admin dashboard
            </Link>
          </div>
        </div>
        <div className="panel overflow-hidden">
          <div className="border-b border-civic-line bg-civic-pine p-5 text-white">
            <div className="text-sm font-semibold uppercase tracking-wide text-white/70">Official draw packet</div>
            <div className="mt-2 text-2xl font-bold">World Cup Community Ticket Draw</div>
          </div>
          <div className="grid gap-4 p-5">
            {[
              ["Hybrid registration", "Pre-event link, live QR code, and recorded representative entry."],
              ["List integrity", "Duplicate detection by email, phone, similar name, and representative patterns."],
              ["Audit trail", "Every registration, status change, lock, export, and draw is recorded."],
              ["Verification", "Locked participant count and public hash are shown with results."]
            ].map(([title, copy]) => (
              <div key={title} className="flex gap-3 rounded-lg border border-civic-line bg-civic-paper p-4">
                <FileCheck2 className="mt-1 shrink-0 text-civic-gold" size={22} />
                <div>
                  <div className="font-bold">{title}</div>
                  <div className="text-sm leading-6 text-civic-ink/68">{copy}</div>
                </div>
              </div>
            ))}
            <Link className="btn-secondary mt-2" href="/display/world-cup-community-draw">
              <MonitorUp size={16} />
              Open display mode
            </Link>
          </div>
        </div>
      </section>
    </CivicShell>
  );
}
