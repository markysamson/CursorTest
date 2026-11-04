import Link from "next/link";
import { ClouderaLogo } from "@/components/brand/ClouderaLogo";
import { BOARD_SET_CONFIG } from "@/lib/board-sets";
import { MISSED_VISIT_RENT_MULTIPLIER, RENT_PRICE_RATIO } from "@/lib/property-economics";

const rentPercent = Math.round(RENT_PRICE_RATIO * 100);
const missedMultiplier = MISSED_VISIT_RENT_MULTIPLIER;

export default function RulesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-white px-4 py-8 pb-16">
      <ClouderaLogo href="/" size="sm" />
      <h1 className="mt-6 text-2xl font-bold text-cloudera-navy">Monopoly Run — rules</h1>
      <p className="mt-2 text-sm text-cloudera-gray">
        GPS team game on real landmark stops: preview reference photos, check in on location, buy with a
        selfie, and pay rent. Your manager runs the board from the admin console.
      </p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-cloudera-navy">
        <div>
          <h2 className="text-lg font-bold">Getting started</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The manager creates teams, adjusts run settings if needed, and starts the run when ready.</li>
            <li>Team leaders sign in on mobile with their team PIN.</li>
            <li>Allow location access — check-ins only work when GPS shows you at the landmark.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Landmarks &amp; photos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Each stop is a real-world landmark, not a street name.</li>
            <li>
              The board list shows a <strong>reference photo</strong> for each stop. Tap the photo or
              property row to open a larger version so your team knows what to look for.
            </li>
            <li>
              To <strong>buy</strong>, take a team selfie with the landmark visible behind you (same as
              the reference shot).
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Check-in radius</h2>
          <p className="mt-2">
            You must be within the run&apos;s geofence distance of a landmark to check in. The manager can
            change this under <strong>Run settings</strong>. Default radii for new games (metres):
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {(
              Object.entries(BOARD_SET_CONFIG) as [
                keyof typeof BOARD_SET_CONFIG,
                (typeof BOARD_SET_CONFIG)[keyof typeof BOARD_SET_CONFIG],
              ][]
            ).map(([id, cfg]) => (
              <li key={id}>
                {cfg.label} — {cfg.geofenceRadiusM}m
              </li>
            ))}
          </ul>
          <p className="mt-2 text-cloudera-gray">
            Games already in progress keep the radius saved for that run.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Team map</h2>
          <p className="mt-2">
            The manager can turn the live map on or off in Run settings. When it is off, teams still see
            the landmark list, reference photos, and GPS check-in.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Buying &amp; rent</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Each property shows <strong>buy price</strong> and <strong>rent</strong> on your board list.
              Rent is about {rentPercent}% of the purchase price (rounded).
            </li>
            <li>
              When you arrive at an <strong>unowned</strong> stop, tap{" "}
              <strong>Selfie with … &amp; buy</strong> and complete the selfie to purchase.
            </li>
            <li>
              When you arrive on a square owned by another team, tap to <strong>pay rent</strong> — no
              selfie required.
            </li>
            <li>When you visit your own property, you can log the visit without paying rent.</li>
            <li>Rent is paid to the owning team&apos;s balance.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Ending the run</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The run does not end automatically when every property is sold.</li>
            <li>The manager ends the run from the manager console.</li>
            <li>
              When the run ends, each team pays{" "}
              <strong>
                {missedMultiplier}× the base rent
              </strong>{" "}
              to the bank for every board stop they never visited during the game.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Manager console</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Create teams, start and end the run, and view the live map and leaderboard.</li>
            <li>
              <strong>Run settings</strong> — geofence distance and whether teams see the map.
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
        <Link
          href="/admin/login"
          className="btn-secondary rounded-xl py-3 text-center text-sm font-semibold"
        >
          Manager login
        </Link>
        <Link href="/" className="text-center text-sm font-medium text-cloudera-gray underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
