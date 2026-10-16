import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 px-6 py-16">
      <div className="board-card rounded-3xl p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200/80">London edition</p>
        <h1 className="mt-2 text-4xl font-bold text-amber-100">Monopoly Run</h1>
        <p className="mt-4 text-sm leading-relaxed text-emerald-50/90">
          Race across real London streets. Verify your arrival with GPS, snap a selfie to buy
          properties, and pay rent when you land on rival teams&apos; squares.
        </p>
      </div>

      <div className="grid gap-4">
        <Link
          href="/team/login"
          className="board-card rounded-2xl px-6 py-5 text-center text-lg font-semibold text-amber-100 transition hover:border-amber-300/60"
        >
          Team login
          <span className="mt-1 block text-sm font-normal text-emerald-100/80">
            For team leaders on mobile
          </span>
        </Link>
        <Link
          href="/admin/login"
          className="board-card rounded-2xl px-6 py-5 text-center text-lg font-semibold text-amber-100 transition hover:border-amber-300/60"
        >
          Manager console
          <span className="mt-1 block text-sm font-normal text-emerald-100/80">
            Create teams &amp; track scores
          </span>
        </Link>
      </div>
    </main>
  );
}
