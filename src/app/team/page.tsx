"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ClouderaLogo } from "@/components/brand/ClouderaLogo";
import { GeoTracker, type GeoPosition } from "@/components/GeoTracker";
import { RunMapLazy } from "@/components/maps/RunMapLazy";
import { COLOR_GROUP_STYLES } from "@/lib/locations-data";
import type { MapPropertyMarker, MapTeamMarker } from "@/lib/map-types";

type LocationState = {
  id: string;
  name: string;
  colorGroup: string;
  price: number;
  rent: number;
  latitude: number;
  longitude: number;
  distanceM: number | null;
  inRange: boolean;
  action: "purchase" | "rent" | "own" | "none";
  owner: { id: string; name: string; selfiePath: string } | null;
};

type OwnedProperty = {
  id: string;
  name: string;
  colorGroup: string;
  price: number;
  rent: number;
  selfiePath: string;
  latitude: number;
  longitude: number;
};

type TeamState = {
  game: { name: string; status: string; geofenceRadiusM: number };
  team: { id: string; name: string; leaderName: string; balance: number };
  locations: LocationState[];
  ownedProperties: OwnedProperty[];
  recentVisits: {
    visitType: string;
    amount: number;
    createdAt: string;
    location: { name: string };
  }[];
};

export default function TeamAppPage() {
  const router = useRouter();
  const [geo, setGeo] = useState<GeoPosition | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [state, setState] = useState<TeamState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingLocation = useRef<string | null>(null);

  const onGeoUpdate = useCallback((pos: GeoPosition | null, err: string | null) => {
    setGeo(pos);
    setGeoError(err);
  }, []);

  const loadState = useCallback(async () => {
    const qs =
      geo != null ? `?lat=${geo.latitude}&lng=${geo.longitude}` : "";
    const res = await fetch(`/api/team/state${qs}`, { credentials: "same-origin" });
    if (res.status === 401) {
      router.replace("/team/login");
      return;
    }
    if (res.ok) {
      setState(await res.json());
    }
  }, [geo, router]);

  useEffect(() => {
    const boot = window.setTimeout(() => void loadState(), 0);
    const t = window.setInterval(() => void loadState(), 6000);
    return () => {
      window.clearTimeout(boot);
      window.clearInterval(t);
    };
  }, [loadState]);

  useEffect(() => {
    if (geo == null) return;
    const { latitude, longitude } = geo;
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
  }, [geo?.latitude, geo?.longitude]);

  async function performCheckIn(locationId: string, selfie?: File) {
    if (!geo) {
      setMessage("Waiting for GPS before check-in.");
      return;
    }
    setCheckingIn(locationId);
    setMessage(null);
    const form = new FormData();
    form.set("locationId", locationId);
    form.set("latitude", String(geo.latitude));
    form.set("longitude", String(geo.longitude));
    if (selfie) form.set("selfie", selfie);

    const res = await fetch("/api/team/check-in", { method: "POST", body: form });
    setCheckingIn(null);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error ?? "Check-in failed");
      return;
    }
    const r = data.result;
    if (r.type === "PURCHASE") {
      setMessage(`Purchased ${r.location.name} for £${r.amount}!`);
    } else if (r.type === "RENT") {
      setMessage(`Paid £${r.amount} rent to ${r.ownerName} at ${r.location.name}.`);
    } else {
      setMessage(`Welcome back to your property at ${r.location.name}.`);
    }
    loadState();
  }

  function startPurchase(locationId: string) {
    pendingLocation.current = locationId;
    fileRef.current?.click();
  }

  function onSelfieSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const locId = pendingLocation.current;
    e.target.value = "";
    pendingLocation.current = null;
    if (file && locId) {
      performCheckIn(locId, file);
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

  const { game, team, locations, ownedProperties } = state;
  const nearby = locations.filter((l) => l.inRange);
  const portfolioValue = ownedProperties.reduce((sum, p) => sum + p.price, 0);
  const rentPerVisit = ownedProperties.reduce((sum, p) => sum + p.rent, 0);

  const mapProperties: MapPropertyMarker[] = locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    colorGroup: loc.colorGroup,
    ownerName: loc.owner?.name ?? null,
    price: loc.price,
  }));

  const mapTeams: MapTeamMarker[] = geo
    ? [
        {
          id: "self",
          name: team.name,
          latitude: geo.latitude,
          longitude: geo.longitude,
          leaderName: team.leaderName,
          isSelf: true,
        },
      ]
    : [];

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-white px-4 pb-24 pt-6">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
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
        <div className="mt-3">
          <GeoTracker onUpdate={onGeoUpdate} />
        </div>
        {geoError && <p className="mt-2 text-xs text-red-600">{geoError}</p>}
        {game.status !== "ACTIVE" && (
          <p className="mt-2 rounded-lg bg-cloudera-blue-soft px-3 py-2 text-xs font-medium text-cloudera-navy">
            The manager has not started the run yet. You can preview locations but cannot buy or pay
            rent until the game is active.
          </p>
        )}
      </header>

      <section className="board-card mb-4 rounded-2xl p-3">
        <h2 className="section-heading mb-2 px-1">Map</h2>
        <RunMapLazy properties={mapProperties} teams={mapTeams} heightClassName="h-64" />
        {!geo && (
          <p className="mt-2 px-1 text-xs font-medium text-cloudera-gray">
            Enable location to see your team on the map.
          </p>
        )}
      </section>

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
            You don&apos;t own any squares yet. Visit an unowned location, take a selfie, and buy your
            first property.
          </p>
        ) : (
          <ul className="space-y-3">
            {ownedProperties.map((prop) => {
              const style = COLOR_GROUP_STYLES[prop.colorGroup];
              return (
                <li
                  key={prop.id}
                  className="flex items-center gap-3 rounded-xl border border-cloudera-blue/30 bg-cloudera-blue-soft p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prop.selfiePath}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-cloudera-navy">{prop.name}</p>
                    <p className="text-xs font-medium text-cloudera-gray">
                      Paid £{prop.price} · Rent £{prop.rent} when rivals visit
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase text-white ${style?.bg ?? "bg-zinc-500"}`}
                    >
                      {style?.label ?? prop.colorGroup}
                    </span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${prop.latitude},${prop.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-semibold text-cloudera-orange-dark underline"
                    >
                      Directions
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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
              const style = COLOR_GROUP_STYLES[loc.colorGroup];
              return (
                <li key={loc.id} className="board-card rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-cloudera-navy">{loc.name}</p>
                      <p className="text-xs font-medium text-cloudera-gray">
                        {loc.distanceM}m away · Buy £{loc.price} · Rent £{loc.rent}
                      </p>
                      {loc.owner && (
                        <p className="mt-1 text-xs font-medium text-cloudera-gray">
                          Owner: {loc.owner.name}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-medium uppercase ${style?.bg ?? "bg-white/10"}`}
                    >
                      {style?.label ?? loc.colorGroup}
                    </span>
                  </div>
                  {loc.action === "purchase" && (
                    <button
                      type="button"
                      disabled={!!checkingIn}
                      onClick={() => startPurchase(loc.id)}
                      className="btn-primary mt-3 w-full rounded-xl py-2.5 text-sm disabled:opacity-60"
                    >
                      {checkingIn === loc.id ? "Uploading…" : "Take selfie & buy property"}
                    </button>
                  )}
                  {loc.action === "rent" && (
                    <button
                      type="button"
                      disabled={!!checkingIn}
                      onClick={() => performCheckIn(loc.id)}
                      className="btn-danger mt-3 w-full rounded-xl py-2.5 text-sm disabled:opacity-60"
                    >
                      {checkingIn === loc.id ? "Processing…" : `Pay rent (£${loc.rent})`}
                    </button>
                  )}
                  {loc.action === "own" && (
                    <button
                      type="button"
                      disabled={!!checkingIn}
                      onClick={() => performCheckIn(loc.id)}
                      className="btn-secondary mt-3 w-full rounded-xl py-2.5 text-sm disabled:opacity-60"
                    >
                      {checkingIn === loc.id ? "Logging…" : "Log visit (your property)"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h2 className="section-heading mb-2">London board ({locations.length} stops)</h2>
        <ul className="space-y-2">
          {locations.map((loc) => {
            const style = COLOR_GROUP_STYLES[loc.colorGroup];
            const owned = !!loc.owner;
            const isMine = loc.owner?.id === team.id;
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
                <div
                  className={`h-10 w-2 shrink-0 rounded-full ${style?.bg ?? "bg-white/20"}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-cloudera-navy">{loc.name}</p>
                  <p className="text-xs font-medium text-cloudera-gray">
                    {isMine ? "Your property" : owned ? `Owned · ${loc.owner?.name}` : "Unowned"}
                    {loc.distanceM != null && ` · ${loc.distanceM}m`}
                  </p>
                </div>
                {isMine && (
                  <span className="shrink-0 rounded-full bg-cloudera-blue-soft px-2 py-0.5 text-[10px] font-bold uppercase text-cloudera-navy">
                    Yours
                  </span>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-xs text-cloudera-orange underline"
                >
                  Map
                </a>
              </li>
            );
          })}
        </ul>
      </section>

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
