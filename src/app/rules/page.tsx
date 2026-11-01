import Link from "next/link";
import { ClouderaLogo } from "@/components/brand/ClouderaLogo";

export default function RulesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-white px-4 py-8 pb-16">
      <ClouderaLogo href="/" size="sm" />
      <h1 className="mt-6 text-2xl font-bold text-cloudera-navy">Monopoly Run — rules</h1>
      <p className="mt-2 text-sm text-cloudera-gray">
        GPS team game: visit real locations, buy properties, pay rent, build hotels. Your manager
        runs the board from the admin console.
      </p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-cloudera-navy">
        <div>
          <h2 className="text-lg font-bold">Getting started</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The manager creates teams and starts the run when everyone is ready.</li>
            <li>Team leaders sign in on mobile with their team PIN.</li>
            <li>Allow location access — check-ins only work when GPS shows you at the property.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Check-in radius</h2>
          <p className="mt-2">
            You must be within the run&apos;s geofence distance of a property to check in. Default
            radii for new games (metres):
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Full London — 80m (was 120m)</li>
            <li>City of London — 65m (was 100m)</li>
            <li>Saffron Walden — 65m (was 100m)</li>
            <li>Wendens Ambo — 50m (was 80m)</li>
          </ul>
          <p className="mt-2 text-cloudera-gray">
            Games already in progress keep the radius set when they were created.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Buying &amp; rent</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Each property shows a price and rent on your board list.</li>
            <li>
              When you arrive, tap <strong>Buy property</strong> and take a team selfie. If the
              square is free, you pay the price. If another team already owns it, you&apos;ll see
              that after the photo is sent and rent is taken (no rival names are shown beforehand).
            </li>
            <li>
              You cannot see which rival owns a square. Your view is only <strong>Owned</strong>{" "}
              (your team) or <strong>Unowned</strong>.
            </li>
            <li>After a successful buy or rent at a location, the action button hides until you leave and return.</li>
            <li>Rent goes to the owning team. Hotels double the rent rivals pay on that square.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Hotels</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Own every property in a colour group to unlock hotels on those squares.</li>
            <li>
              Build a hotel from <strong>Your properties</strong> at any time — you do not need to
              be standing at the square.
            </li>
            <li>Hotel cost equals the property price; rent doubles for that square.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Ending the run</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The run does not end automatically when every property is sold.</li>
            <li>The manager ends the run from the admin console.</li>
            <li>
              When the run ends, each team pays <strong>double the base rent</strong> to the bank
              for every board square they never visited during the game.
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-3">
        <Link
          href="/team/login"
          className="btn-primary rounded-xl py-3 text-center text-sm font-semibold"
        >
          Team login
        </Link>
        <Link href="/" className="text-center text-sm font-medium text-cloudera-gray underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
