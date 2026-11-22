import Link from "next/link";
import { ClouderaLogo } from "@/components/brand/ClouderaLogo";
import { getAdminSession, getTeamSession } from "@/lib/auth";

export default async function HomePage() {
  const [teamSession, adminSession] = await Promise.all([getTeamSession(), getAdminSession()]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 px-6 py-16">
      <div className="board-card board-card-accent rounded-3xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <ClouderaLogo href="/" size="lg" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cloudera-orange-dark">
          London edition
        </p>
        <h1 className="mt-2 text-4xl font-bold text-cloudera-navy">Monopoly Run</h1>
        <p className="mt-4 text-sm leading-relaxed text-cloudera-gray">
          Race across real London streets. Verify your arrival with GPS, snap a selfie to buy
          properties, and pay rent when you land on rival teams&apos; properties.
        </p>
      </div>

      <div className="grid gap-4">
        {teamSession && (
          <Link
            href="/team"
            className="board-card rounded-2xl px-6 py-5 text-center transition hover:border-cloudera-blue hover:shadow-md"
          >
            <span className="text-lg font-semibold text-cloudera-navy">Continue to team board</span>
            <span className="mt-1 block text-sm font-medium text-cloudera-gray">You&apos;re still signed in</span>
          </Link>
        )}
        {adminSession && (
          <Link
            href="/admin"
            className="board-card rounded-2xl px-6 py-5 text-center transition hover:border-cloudera-blue hover:shadow-md"
          >
            <span className="text-lg font-semibold text-cloudera-navy">Continue to manager console</span>
            <span className="mt-1 block text-sm font-medium text-cloudera-gray">You&apos;re still signed in</span>
          </Link>
        )}
        {!teamSession && (
        <Link
          href="/team/login"
          className="board-card rounded-2xl px-6 py-5 text-center transition hover:border-cloudera-blue hover:shadow-md"
        >
          <span className="text-lg font-semibold text-cloudera-navy">Team login</span>
          <span className="mt-1 block text-sm font-medium text-cloudera-gray">
            For team leaders on mobile
          </span>
        </Link>
        )}
        {!adminSession && (
        <Link
          href="/admin/login"
          className="board-card rounded-2xl px-6 py-5 text-center transition hover:border-cloudera-blue hover:shadow-md"
        >
          <span className="text-lg font-semibold text-cloudera-navy">Manager console</span>
          <span className="mt-1 block text-sm font-medium text-cloudera-gray">
            Create teams &amp; track scores
          </span>
        </Link>
        )}
        <Link
          href="/rules"
          className="board-card rounded-2xl px-6 py-5 text-center transition hover:border-cloudera-blue hover:shadow-md"
        >
          <span className="text-lg font-semibold text-cloudera-navy">Rules</span>
          <span className="mt-1 block text-sm font-medium text-cloudera-gray">
            Landmarks, buying, rent, hotels &amp; scoring
          </span>
        </Link>
      </div>
    </main>
  );
}
