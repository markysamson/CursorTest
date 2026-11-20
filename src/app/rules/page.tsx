import { ClouderaLogo } from "@/components/brand/ClouderaLogo";
import { RulesPageFooter } from "@/components/RulesPageFooter";
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
        selfie when needed, pay rent, and build hotels. Your manager runs the board from the admin
        console.
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
              To <strong>buy</strong> an unowned stop, take a team selfie with the landmark visible behind
              you (like the reference shot).
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
              Each property shows <strong>price</strong> and <strong>rent</strong> on your board list. Base
              rent is about {rentPercent}% of the purchase price (rounded).
            </li>
            <li>
              When you arrive, tap <strong>Buy property</strong>. If another team already owns it, rent is
              taken immediately (no selfie). If it is unowned, you&apos;ll be asked to take a team selfie to
              complete the purchase.
            </li>
            <li>
              Each team can only check in once per property (buy or pay rent). Completed properties
              disappear from &quot;You&apos;re here — check in&quot;.
            </li>
            <li>
              You cannot see which rival owns a property. Your view is only <strong>Owned</strong> (your team)
              or <strong>Unowned</strong>.
            </li>
            <li>Rent goes to the owning team. Hotels double the rent rivals pay on that property.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Hotels</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Own every property in a colour group to unlock hotels on those properties.</li>
            <li>
              Build a hotel from <strong>Your properties</strong> at any time — you do not need to be
              standing at the property.
            </li>
            <li>Hotel cost equals the property price; rent doubles for that property.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Ending the run</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The run does not end automatically when every property is sold.</li>
            <li>The manager ends the run from the manager console.</li>
            <li>
              When the run ends, each team pays{" "}
              <strong>{missedMultiplier}× the base rent</strong> to the bank for every board stop they never
              visited during the game.
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
            <li>
              <strong>Properties</strong> — rename properties, move their pin on the map, change their
              reference photo, and add or delete properties on any board. Changes reach teams straight
              away, so fix positions before the run where possible.
            </li>
          </ul>
        </div>
      </section>

      <RulesPageFooter />
    </main>
  );
}