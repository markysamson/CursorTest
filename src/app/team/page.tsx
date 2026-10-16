"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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

type TeamState = {
  game: { name: string; status: string; geofenceRadiusM: number };
  team: { name: string; leaderName: string; balance: number };
  locations: LocationState[];
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
      <main className="flex min-h-screen items-center justify-center text-emerald-100/80">
        Loading team board…
      </main>
    );
  }

  const { game, team, locations } = state;
  const nearby = locations.filter((l) => l.inRange);

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
    <main className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-6">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={onSelfieSelected}
      />

      <header className="board-card mb-4 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href="/" className="text-xs text-emerald-100/70">
              Monopoly Run
            </Link>
            <h1 className="text-xl font-bold text-amber-100">{team.name}</h1>
            <p className="text-xs text-emerald-50/80">Leader: {team.leaderName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-200">£{team.balance}</p>
            <p className="text-xs uppercase tracking-wide text-emerald-100/70">{game.status}</p>
          </div>
        </div>
        <div className="mt-3">
          <GeoTracker onUpdate={onGeoUpdate} />
        </div>
        {geoError && <p className="mt-2 text-xs text-red-300">{geoError}</p>}
        {game.status !== "ACTIVE" && (
          <p className="mt-2 rounded-lg bg-black/25 px-3 py-2 text-xs text-amber-100">
            The manager has not started the run yet. You can preview locations but cannot buy or pay
            rent until the game is active.
          </p>
        )}
      </header>

      <section className="board-card mb-4 rounded-2xl p-3">
        <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-amber-200/90">
          Map
        </h2>
        <RunMapLazy properties={mapProperties} teams={mapTeams} heightClassName="h-64" />
        {!geo && (
          <p className="mt-2 px-1 text-xs text-emerald-100/70">
            Enable location to see your team on the map.
          </p>
        )}
      </section>

      {message && (
        <p className="mb-4 rounded-xl border border-amber-300/30 bg-amber-500/15 px-4 py-3 text-sm text-amber-50">
          {message}
        </p>
      )}

      {nearby.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-200/90">
            You&apos;re here — check in
          </h2>
          <ul className="space-y-3">
            {nearby.map((loc) => {
              const style = COLOR_GROUP_STYLES[loc.colorGroup];
              return (
                <li key={loc.id} className="board-card rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-amber-50">{loc.name}</p>
                      <p className="text-xs text-emerald-100/70">
                        {loc.distanceM}m away · Buy £{loc.price} · Rent £{loc.rent}
                      </p>
                      {loc.owner && (
                        <p className="mt-1 text-xs text-emerald-100/80">
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
                      className="mt-3 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-emerald-950 disabled:opacity-60"
                    >
                      {checkingIn === loc.id ? "Uploading…" : "Take selfie & buy property"}
                    </button>
                  )}
                  {loc.action === "rent" && (
                    <button
                      type="button"
                      disabled={!!checkingIn}
                      onClick={() => performCheckIn(loc.id)}
                      className="mt-3 w-full rounded-xl bg-red-600/90 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {checkingIn === loc.id ? "Processing…" : `Pay rent (£${loc.rent})`}
                    </button>
                  )}
                  {loc.action === "own" && (
                    <button
                      type="button"
                      disabled={!!checkingIn}
                      onClick={() => performCheckIn(loc.id)}
                      className="mt-3 w-full rounded-xl border border-emerald-300/40 py-2.5 text-sm font-semibold disabled:opacity-60"
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
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-200/90">
          London board ({locations.length} stops)
        </h2>
        <ul className="space-y-2">
          {locations.map((loc) => {
            const style = COLOR_GROUP_STYLES[loc.colorGroup];
            const owned = !!loc.owner;
            return (
              <li
                key={loc.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                  loc.inRange ? "border-amber-300/50 bg-amber-500/10" : "border-white/10 bg-black/15"
                }`}
              >
                <div
                  className={`h-10 w-2 shrink-0 rounded-full ${style?.bg ?? "bg-white/20"}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{loc.name}</p>
                  <p className="text-xs text-emerald-100/70">
                    {owned ? `Owned · ${loc.owner?.name}` : "Unowned"}
                    {loc.distanceM != null && ` · ${loc.distanceM}m`}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-xs text-amber-200 underline"
                >
                  Map
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0c2d1b]/95 p-4">
        <button
          type="button"
          onClick={logout}
          className="mx-auto block text-sm text-emerald-100/80 underline"
        >
          Sign out
        </button>
      </footer>
    </main>
  );
}
