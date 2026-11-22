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
        Monopoly Run is a GPS team game played at real landmarks. Preview the reference photos, check in at each property,
        buy with a selfie when one is needed, pay rent, and build hotels. The manager runs the board from
        the manager console.
      </p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-cloudera-navy">
        <div>
          <h2 className="text-lg font-bold">Getting started</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The manager creates teams, adjusts run settings if needed, and starts the run when ready.</li>
            <li>Team leaders sign in on mobile with their team PIN.</li>
            <li>
              Allow location access. A check-in works only when your position is at the property, unless the
              manager has turned on test mode.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Landmarks &amp; photos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Each property is a real landmark, not a street name.</li>
            <li>
              The board list shows a <strong>reference photo</strong> for each property. Tap the photo or
              the property row to open a larger version, so the team knows what to look for.
            </li>
            <li>
              Every check-in needs a team selfie with the landmark visible behind you, in the same way as
              the reference photo. This applies whether you buy, pass or pay rent.
            </li>
            <li>
              Each property carries its <strong>colour group</strong> as a coloured band in your lists.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Check-in radius</h2>
          <p className="mt-2">
            You must be within the run&apos;s check-in distance of a property. The manager sets that
            distance in <strong>Run settings</strong>. These are the distances a new game starts with:
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
            A game that is already under way keeps the distance saved for that run.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Team map</h2>
          <p className="mt-2">
            The manager can show or hide the live map in Run settings. When the map is hidden, teams still
            see the property list, the reference photos, and GPS check-in. In test mode the map stays
            visible, and a team can tap it to set their position instead of using GPS.
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
              When you arrive, tap <strong>Check in</strong> and take the team selfie.
            </li>
            <li>
              If another team already owns the property, rent is taken straight away. If nobody owns it,
              you choose <strong>Buy</strong> or <strong>Pass</strong>.
            </li>
            <li>
              A message shows exactly what you did and how much you paid, and your new balance.
            </li>
            <li>
              Each team can only check in once per property to buy or pay rent. Once you have, it
              disappears from &quot;You&apos;re here — check in&quot;. If you pass, nothing is charged
              and you can come back and buy it later.
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
          <h2 className="text-lg font-bold">Chance cards</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The manager can send a Chance card to every team at any time during the run.</li>
            <li>Each card has an activity, a reward, and a time limit.</li>
            <li>
              Send a photo of the activity before the time runs out. The reward is added only after the
              manager approves the photo. A paid card stays on your page, under your properties, without
              the timer.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Ending the run</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The run does not end automatically when every property is sold.</li>
            <li>The manager ends the run from the manager console.</li>
            <li>
              When the run ends, each team pays{" "}
              <strong>{missedMultiplier}× the base rent</strong> to the bank for every property they did not
              visit during the game. Passing counts as a visit.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Manager console</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Create teams, start and end the run, send Chance cards, and view the live map and leaderboard.</li>
            <li>
              <strong>Run settings</strong> — check-in distance, whether teams see the map, and test mode.
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