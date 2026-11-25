import { ClouderaLogo } from "@/components/brand/ClouderaLogo";
import { getTeamSession } from "@/lib/auth";
import { MISSED_VISIT_RENT_MULTIPLIER, RENT_PRICE_RATIO } from "@/lib/property-economics";
import Link from "next/link";

const rentPercent = Math.round(RENT_PRICE_RATIO * 100);
const missedMultiplier = MISSED_VISIT_RENT_MULTIPLIER;

export default async function RulesPage() {
  const teamSession = await getTeamSession();

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-white px-4 py-8 pb-16">
      <ClouderaLogo href="/" size="sm" />
      <h1 className="mt-6 text-2xl font-bold text-cloudera-navy">Monopoly Run — rules</h1>
      <p className="mt-2 text-sm text-cloudera-gray">
        Monopoly Run is a GPS team game played at real landmarks. Preview the reference photos, check in at each
        property with a selfie, buy or pass, pay rent, and build hotels.
      </p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-cloudera-navy">
        <div>
          <h2 className="text-lg font-bold">Getting started</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Sign in on your phone with your team PIN.</li>
            <li>
              Allow location access. You can only check in when your GPS shows you at the property.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Landmarks &amp; photos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Each property is a real landmark, not a street name.</li>
            <li>
              The board list shows a <strong>reference photo</strong> for each property. Tap the photo or
              the property row to open a larger version, so your team knows what to look for.
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
            <li>A Chance card can arrive for every team at any time during the run.</li>
            <li>Each card has an activity, a reward, and a time limit.</li>
            <li>
              Send a photo of the activity before the time runs out. The reward is added only after the
              photo has been checked and accepted. A paid card stays on your page, under your properties,
              without the timer.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Ending the run</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The run does not end automatically when every property is sold.</li>
            <li>
              When the run ends, each team pays{" "}
              <strong>{missedMultiplier}× the base rent</strong> to the bank for every property they did not
              visit during the game. Passing counts as a visit.
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-3">
        {teamSession ? (
          <Link href="/team" className="btn-primary rounded-xl py-3 text-center text-sm font-semibold">
            Back to team board
          </Link>
        ) : (
          <Link href="/team/login" className="btn-primary rounded-xl py-3 text-center text-sm font-semibold">
            Team login
          </Link>
        )}
        <Link
          href="/"
          className={
            teamSession
              ? "btn-secondary rounded-xl py-3 text-center text-sm font-semibold"
              : "text-center text-sm font-medium text-cloudera-gray underline"
          }
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
