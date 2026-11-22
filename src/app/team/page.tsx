"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ClouderaLogo } from "@/components/brand/ClouderaLogo";
import { TeamChanceCards } from "@/components/team/TeamChanceCards";
import type { TeamChanceCard } from "@/lib/chance-types";
import { GeoTracker, type GeoPosition } from "@/components/GeoTracker";
import { RunMapLazy } from "@/components/maps/RunMapLazy";
import { LandmarkPhoto } from "@/components/LandmarkPhoto";
import { LandmarkPhotoPreviewModal } from "@/components/LandmarkPhotoPreviewModal";
import { landmarkImageProxyUrl } from "@/lib/landmark-image-url";
import { COLOR_GROUP_STYLES } from "@/lib/locations-data";
import { PropertyColorBar, PropertyColorChip } from "@/components/PropertyColor";
import { CheckInOutcome, type CheckInOutcomeData } from "@/components/team/CheckInOutcome";
import { resizeImageForUpload } from "@/lib/client-image";
import type { MapPropertyMarker, MapTeamMarker } from "@/lib/map-types";

type LocationState = {
  id: string;
  name: string;
  colorGroup: string;
  price: number;
  rent: number;
  rentDue: number;
  photoRev: string;
  latitude: number;
  longitude: number;
  distanceM: number | null;
  inRange: boolean;
  action: "checkin" | "none";
  possession: "owned" | "unowned";
  ownedByYou: boolean;
  alreadyCompleted: boolean;
  passedBefore: boolean;
  hasHotel: boolean;
  hotelCost: number;
  canBuyHotel: boolean;
};

type OwnedProperty = {
  id: string;
  name: string;
  colorGroup: string;
  price: number;
  rent: number;
  rentDue: number;
  hasHotel: boolean;
  canBuyHotel: boolean;
  hotelCost: number;
  selfiePath: string;
  latitude: number;
  longitude: number;
};

type PendingChoice = {
  locationId: string;
  file: File;
  previewUrl: string;
  price: number;
  canAfford: boolean;
};

type TeamState = {
  game: {
    name: string;
    status: string;
    geofenceRadiusM: number;
    showTeamMap: boolean;
    testMode: boolean;
    boardSetLabel: string;
  };
  team: { id: string; name: string; leaderName: string; balance: number };
  locations: LocationState[];
  ownedProperties: OwnedProperty[];
  recentVisits: {
    visitType: string;
    amount: number;
    createdAt: string;
    location: { name: string };
  }[];
  chanceCards?: TeamChanceCard[];
};

export default function TeamAppPage() {
  const router = useRouter();
  const [geo, setGeo] = useState<GeoPosition | null>(null);
  const [pin, setPin] = useState<GeoPosition | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [state, setState] = useState<TeamState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<{ name: string; url: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingLocation = useRef<string | null>(null);
  const [choice, setChoice] = useState<PendingChoice | null>(null);
  const [outcome, setOutcome] = useState<CheckInOutcomeData | null>(null);

  const openLandmarkPreview = useCallback((loc: { id: string; name: string; photoRev?: string }) => {
    setPhotoPreview({ name: loc.name, url: landmarkImageProxyUrl(loc.id, loc.photoRev) });
  }, []);

  const onGeoUpdate = useCallback((pos: GeoPosition | null, err: string | null) => {
    setGeo(pos);
    setGeoError(err);
  }, []);

  const testMode = state?.game.testMode === true;
  const here = testMode && pin ? pin : geo;

  const loadState = useCallback(async () => {
    const qs =
      here != null ? `?lat=${here.latitude}&lng=${here.longitude}` : "";
    const res = await fetch(`/api/team/state${qs}`, { credentials: "same-origin" });
    if (res.status === 401) {
      router.replace("/team/login");
      return;
    }
    if (res.ok) {
      setState(await res.json());
    }
  }, [here, router]);

  useEffect(() => {
    const boot = window.setTimeout(() => void loadState(), 0);
    const t = window.setInterval(() => void loadState(), 6000);
    return () => {
      window.clearTimeout(boot);
      window.clearInterval(t);
    };
  }, [loadState]);

  useEffect(() => {
    if (here == null) return;
    const { latitude, longitude } = here;
    let cancelled = false;
    const send = async () => {
      if (cancelled) return;
      const res = await fetch("/api/team/location", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!res.ok && !cancelled) {
        console.warn("Could not report team location to manager map", await res.text());
      }
    };
    void send();
    const t = window.setInterval(() => void send(), 12000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [here?.latitude, here?.longitude]);

  function clearChoice() {
    setChoice((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  }

  async function performCheckIn(
    locationId: string,
    options: { selfie: File; decision?: "buy" | "pass" },
  ) {
    if (!here) {
      setMessage(testMode ? "Tap the map to set your location before check-in." : "Waiting for GPS before check-in.");
      return;
    }
    setCheckingIn(locationId);
    setMessage(null);
    const form = new FormData();
    form.set("locationId", locationId);
    form.set("latitude", String(here.latitude));
    form.set("longitude", String(here.longitude));
    form.set("selfie", options.selfie);
    if (options.decision) form.set("decision", options.decision);

    let res: Response;
    try {
      res = await fetch("/api/team/check-in", { method: "POST", body: form });
    } catch {
      setCheckingIn(null);
      setMessage("Could not reach the server. Check your signal and try again.");
      return;
    }
    setCheckingIn(null);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error ?? "Check-in failed");
      return;
    }

    const r = data.result;
    if (r.type === "CHOICE") {
      setChoice((prev) => {
        if (prev) URL.revokeObjectURL(prev.previewUrl);
        return {
          locationId,
          file: options.selfie,
          previewUrl: URL.createObjectURL(options.selfie),
          price: r.price,
          canAfford: r.canAfford,
        };
      });
      return;
    }

    clearChoice();
    setOutcome({
      kind: r.type,
      propertyName: r.location.name,
      colorGroup: r.location.colorGroup,
      amount: r.amount,
      balanceAfter: r.balanceAfter,
    });
    loadState();
  }

  function armSelfieForLocation(locationId: string) {
    pendingLocation.current = locationId;
  }

  async function buyHotelRemote(locationId: string) {
    setCheckingIn(locationId);
    setMessage(null);
    const res = await fetch("/api/team/hotel", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId }),
    });
    setCheckingIn(null);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error ?? "Could not build hotel");
      return;
    }
    const r = data.result;
    setOutcome({
      kind: "HOTEL_PURCHASE",
      propertyName: r.location.name,
      colorGroup: r.location.colorGroup,
      amount: r.amount,
      balanceAfter: r.balanceAfter,
      rentNow: r.rentNow,
    });
    loadState();
  }

  async function onSelfieSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const locId = pendingLocation.current;
    e.target.value = "";
    pendingLocation.current = null;
    if (!file || !locId) return;
    try {
      const photo = await resizeImageForUpload(file);
      await performCheckIn(locId, { selfie: photo });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not use that photo.");
    }
  }

  async function logout() {
    await fetch("/api/team/logout", { method: "POST" });
    router.replace("/team/login");
  }

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center font-medium text-cloudera-gray">
        Loading team board…
      </main>
    );
  }

  const { game, team, locations, ownedProperties, chanceCards = [] } = state;
  const nearby = locations.filter(
    (l) => l.inRange && !l.alreadyCompleted && l.action === "checkin",
  );
  const activeChoice =
    choice && nearby.some((l) => l.id === choice.locationId) ? choice : null;
  const portfolioValue = ownedProperties.reduce((sum, p) => sum + p.price, 0);
  const rentPerVisit = ownedProperties.reduce((sum, p) => sum + p.rentDue, 0);

  const mapProperties: MapPropertyMarker[] = locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    colorGroup: loc.colorGroup,
    price: loc.price,
    rent: loc.rent,
    possession: loc.possession,
  }));

  const mapTeams: MapTeamMarker[] = here
    ? [
        {
          id: "self",
          name: team.name,
          latitude: here.latitude,
          longitude: here.longitude,
          leaderName: team.leaderName,
          isSelf: true,
        },
      ]
    : [];

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-white px-4 pb-24 pt-6">
      <input
        id="team-selfie-capture"
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        onChange={onSelfieSelected}
      />

      <header className="board-card board-card-accent mb-4 rounded-2xl p-4">
        <ClouderaLogo href="/" size="sm" />
        <div className="mt-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cloudera-blue">
              Monopoly Run
            </p>
            <h1 className="text-xl font-bold text-cloudera-navy">{team.name}</h1>
            <p className="text-xs font-medium text-cloudera-gray">Leader: {team.leaderName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-cloudera-orange-dark">£{team.balance}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-cloudera-navy">
              {game.status}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <GeoTracker onUpdate={onGeoUpdate} />
          <Link href="/rules" className="text-xs font-semibold text-cloudera-orange-dark underline">
            Rules
          </Link>
        </div>
        {geoError && <p className="mt-2 text-xs text-red-600">{geoError}</p>}
        {game.status === "SETUP" && (
          <p className="mt-2 rounded-lg bg-cloudera-blue-soft px-3 py-2 text-xs font-medium text-cloudera-navy">
            The manager has not started the run yet. You can preview locations but cannot buy or pay
            rent until the game is active.
          </p>
        )}
        {game.status === "FINISHED" && (
          <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-xs font-medium text-amber-950">
            This run has ended. Unvisited properties were charged at 1.5× rent to the bank. Your balance
            above is final.
          </p>
        )}
      </header>

      <TeamChanceCards
        cards={chanceCards.filter((card) => card.submission?.status !== "APPROVED")}
        gameFinished={game.status === "FINISHED"}
        alerts={chanceCards[0]?.submission?.status !== "APPROVED"}
        onSubmitted={() => void loadState()}
      />

      {(game.showTeamMap || game.testMode) && (
        <section className="board-card mb-4 rounded-2xl p-3">
          <h2 className="section-heading mb-2 px-1">Map</h2>
          {game.testMode && (
            <p className="mb-2 px-1 text-xs font-medium text-cloudera-orange-dark">
              Test mode is on. Tap the map to set your team&apos;s location. That position replaces GPS
              until the manager turns test mode off.
            </p>
          )}
          <RunMapLazy
            properties={mapProperties}
            teams={mapTeams}
            geofenceRadiusM={game.geofenceRadiusM}
            heightClassName="h-64"
            onMapClick={
              game.testMode
                ? (latitude, longitude) => setPin({ latitude, longitude, accuracy: 1 })
                : undefined
            }
          />
          <p className="mt-2 px-1 text-xs font-medium text-cloudera-gray">
            Shaded circles are the check-in area ({game.geofenceRadiusM}m around each property).
          </p>
          {!here && (
            <p className="mt-2 px-1 text-xs font-medium text-cloudera-gray">
              {game.testMode
                ? "Tap the map to set your location."
                : "Enable location to see your team on the map."}
            </p>
          )}
        </section>
      )}

      {message && (
        <p className="mb-4 rounded-xl border border-cloudera-blue/40 bg-cloudera-blue-soft px-4 py-3 text-sm font-medium text-cloudera-navy">
          {message}
        </p>
      )}

      {nearby.length > 0 && (
        <section className="mb-6">
          <h2 className="section-heading mb-2">You&apos;re here — check in</h2>
          <ul className="space-y-3">
            {nearby.map((loc) => {
              const choosing = activeChoice?.locationId === loc.id;
              const colour = COLOR_GROUP_STYLES[loc.colorGroup];
              return (
                <li key={loc.id} className="board-card overflow-hidden rounded-2xl">
                  <div className={`h-2 ${colour?.bg ?? "bg-zinc-400"}`} aria-hidden />
                  <div className="p-4">
                    <button
                      type="button"
                      className="mb-3 w-full text-left"
                      onClick={() => openLandmarkPreview(loc)}
                    >
                      <LandmarkPhoto
                        name={loc.name}
                        imageUrl={landmarkImageProxyUrl(loc.id, loc.photoRev)}
                        className="h-36 w-full rounded-xl object-cover"
                      />
                    </button>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-cloudera-navy">{loc.name}</p>
                        <p className="text-xs font-medium text-cloudera-gray">
                          {loc.distanceM}m away · Price £{loc.price} · Rent £{loc.rentDue}
                        </p>
                      </div>
                      <PropertyColorChip group={loc.colorGroup} />
                    </div>

                    {game.status === "ACTIVE" && !choosing && (
                      <>
                        {checkingIn === loc.id ? (
                          <button
                            type="button"
                            disabled
                            className="btn-primary mt-3 w-full rounded-xl py-2.5 text-sm"
                          >
                            Checking in…
                          </button>
                        ) : (
                          <label
                            htmlFor="team-selfie-capture"
                            className={`btn-primary mt-3 flex w-full justify-center rounded-xl py-2.5 text-sm ${
                              checkingIn ? "pointer-events-none opacity-60" : "cursor-pointer"
                            }`}
                            onClick={() => armSelfieForLocation(loc.id)}
                          >
                            Check in
                          </label>
                        )}
                        <p className="mt-2 text-center text-xs font-medium text-cloudera-gray">
                          Take a team selfie with the landmark behind you. If a rival owns this
                          property, rent is taken straight away.
                        </p>
                      </>
                    )}

                    {game.status === "ACTIVE" && choosing && activeChoice && (
                      <div className="mt-3 rounded-xl border border-cloudera-orange/40 bg-cloudera-orange-soft p-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={activeChoice.previewUrl}
                            alt="Your check-in selfie"
                            className="h-16 w-16 shrink-0 rounded-lg object-cover"
                          />
                          <p className="text-sm font-semibold text-cloudera-navy">
                            Nobody owns this property. Buy it for £{activeChoice.price}, or pass?
                          </p>
                        </div>
                        {!activeChoice.canAfford && (
                          <p className="mt-2 text-xs font-semibold text-red-700">
                            You do not have enough to buy this property right now.
                          </p>
                        )}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={!!checkingIn || !activeChoice.canAfford}
                            onClick={() =>
                              void performCheckIn(loc.id, {
                                selfie: activeChoice.file,
                                decision: "buy",
                              })
                            }
                            className="btn-primary rounded-xl py-2.5 text-sm disabled:opacity-60"
                          >
                            {checkingIn === loc.id ? "Working…" : `Buy £${activeChoice.price}`}
                          </button>
                          <button
                            type="button"
                            disabled={!!checkingIn}
                            onClick={() =>
                              void performCheckIn(loc.id, {
                                selfie: activeChoice.file,
                                decision: "pass",
                              })
                            }
                            className="btn-secondary rounded-xl py-2.5 text-sm disabled:opacity-60"
                          >
                            Pass
                          </button>
                        </div>
                        <label
                          htmlFor="team-selfie-capture"
                          className="mt-2 block cursor-pointer text-center text-xs font-semibold text-cloudera-orange-dark underline"
                          onClick={() => armSelfieForLocation(loc.id)}
                        >
                          Retake selfie
                        </label>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="board-card mb-4 rounded-2xl p-4">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="section-heading">Your properties</h2>
          <span className="text-xs font-medium text-cloudera-gray">
            {ownedProperties.length} owned
            {ownedProperties.length > 0 && (
              <> · £{portfolioValue} portfolio · £{rentPerVisit} rent/visit</>
            )}
          </span>
        </div>
        {ownedProperties.length === 0 ? (
          <p className="text-sm font-medium text-cloudera-gray">
            You don&apos;t own any properties yet. Check in at an unowned property and choose Buy.
          </p>
        ) : (
          <ul className="space-y-3">
            {ownedProperties.map((prop) => {
              return (
                <li
                  key={prop.id}
                  className="rounded-xl border border-cloudera-blue/30 bg-cloudera-blue-soft p-2"
                >
                  <div className="flex items-center gap-3">
                    <PropertyColorBar group={prop.colorGroup} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prop.selfiePath}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-cloudera-navy">{prop.name}</p>
                      <p className="text-xs font-medium text-cloudera-gray">
                        Price £{prop.price} · Rent £{prop.rentDue}
                        {prop.hasHotel ? " (hotel)" : ""} when rivals visit
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <PropertyColorChip group={prop.colorGroup} />
                    </div>
                  </div>
                  {prop.canBuyHotel && game.status === "ACTIVE" && (
                    <button
                      type="button"
                      disabled={!!checkingIn}
                      onClick={() => buyHotelRemote(prop.id)}
                      className="btn-primary mt-2 w-full rounded-lg py-2 text-xs disabled:opacity-60"
                    >
                      {checkingIn === prop.id
                        ? "Processing…"
                        : `Build hotel (£${prop.hotelCost}) — rent → £${prop.rent * 2}`}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <TeamChanceCards
        cards={chanceCards.filter((card) => card.submission?.status === "APPROVED")}
        gameFinished={game.status === "FINISHED"}
        alerts={chanceCards[0]?.submission?.status === "APPROVED"}
        onSubmitted={() => void loadState()}
      />

      <section>
        <h2 className="section-heading mb-2">
          {game.boardSetLabel} board ({locations.length} properties)
        </h2>
        <ul className="space-y-2">
          {locations.map((loc) => {
            const isMine = loc.ownedByYou;
            return (
              <li
                key={loc.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                  loc.inRange
                    ? "border-cloudera-orange-dark/40 bg-cloudera-orange-soft"
                    : isMine
                      ? "border-cloudera-blue/40 bg-cloudera-blue-soft"
                      : "border-cloudera-border bg-cloudera-muted/50"
                }`}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => openLandmarkPreview(loc)}
                >
                  <PropertyColorBar group={loc.colorGroup} />
                  <LandmarkPhoto
                    name={loc.name}
                    imageUrl={landmarkImageProxyUrl(loc.id, loc.photoRev)}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-cloudera-navy">{loc.name}</p>
                    <PropertyColorChip group={loc.colorGroup} className="mb-0.5" />
                    <p className="text-xs font-medium text-cloudera-gray">
                      Price £{loc.price} · Rent £{loc.rentDue}
                      {loc.hasHotel ? " · Hotel" : ""}
                    </p>
                    <p className="text-xs font-medium text-cloudera-gray">
                      {loc.alreadyCompleted
                        ? "Checked in"
                        : isMine
                          ? "Owned"
                          : loc.passedBefore
                            ? "Passed"
                            : "Unowned"}
                      {loc.distanceM != null && ` · ${loc.distanceM}m`}
                    </p>
                  </div>
                  {isMine && (
                    <span className="shrink-0 rounded-full bg-cloudera-blue-soft px-2 py-0.5 text-[10px] font-bold uppercase text-cloudera-navy">
                      Owned
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {outcome && <CheckInOutcome outcome={outcome} onClose={() => setOutcome(null)} />}

      {photoPreview && (
        <LandmarkPhotoPreviewModal
          name={photoPreview.name}
          imageUrl={photoPreview.url}
          onClose={() => setPhotoPreview(null)}
        />
      )}

      <footer className="app-footer-bar fixed bottom-0 left-0 right-0 p-4">
        <button
          type="button"
          onClick={logout}
          className="link-muted mx-auto block text-sm underline"
        >
          Sign out
        </button>
      </footer>
    </main>
  );
}
