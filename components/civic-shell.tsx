import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function CivicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <header className="border-b border-civic-line/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-civic-pine text-white">
              <ShieldCheck size={22} />
            </span>
            <span>
              <span className="block text-base font-bold">FairDraw</span>
              <span className="block text-xs text-civic-ink/65">Community Lottery</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold text-civic-ink/75">
            <Link className="rounded-md px-3 py-2 hover:bg-civic-mint" href="/admin">
              Admin
            </Link>
            <Link className="rounded-md px-3 py-2 hover:bg-civic-mint" href="/display/world-cup-community-draw">
              Display
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
