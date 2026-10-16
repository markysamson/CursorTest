"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ClouderaLogo } from "@/components/brand/ClouderaLogo";
import { RunMapLazy } from "@/components/maps/RunMapLazy";
import { COLOR_GROUP_STYLES } from "@/lib/locations-data";
import type { MapPropertyMarker, MapTeamMarker } from "@/lib/map-types";

type Team = { id: string; name: string; leaderName: string; balance: number };
type Game = {
  id: string;
  name: string;
  status: "SETUP" | "ACTIVE" | "FINISHED";
  startingBalance: number;
  geofenceRadiusM: number;
};
type Ownership = {
  id: string;
  selfiePath: string;
  team: { name: string };
  location: { name: string; colorGroup: string };
};
type Visit = {
  id: string;
  visitType: string;
  amount: number;
  createdAt: string;
  team: { name: string };
  location: { name: string };
};
type Dashboard = {
  game: Game & {
    teams: Team[];
    ownerships: Ownership[];
    visits: Visit[];
  };
  leaderboard: (Team & { propertiesOwned: number })[];
  mapProperties: MapPropertyMarker[];
  mapTeams: MapTeamMarker[];
  teamsWithoutLocation: { id: string; name: string; leaderName: string }[];
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState({ name: "", leaderName: "", pin: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/dashboard");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      setError("Failed to load dashboard");
      return;
    }
    setData(await res.json());
  }, [router]);

  useEffect(() => {
    const boot = window.setTimeout(() => void load(), 0);
    const t = window.setInterval(() => void load(), 8000);
    return () => {
      window.clearTimeout(boot);
      window.clearInterval(t);
    };
  }, [load]);

  async function createTeam(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamForm),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Could not create team");
      return;
    }
    setTeamForm({ name: "", leaderName: "", pin: "" });
    load();
  }

  async function setGameStatus(status: Game["status"]) {
    await fetch("/api/admin/game", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function removeTeam(id: string) {
    if (!confirm("Remove this team?")) return;
    await fetch(`/api/admin/teams/${id}`, { method: "DELETE" });
    load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center text-body-muted">
        {error ?? "Loading manager console…"}
      </main>
    );
  }

  const { game, leaderboard, mapProperties, mapTeams, teamsWithoutLocation } = data;

  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-white px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-cloudera-border pb-6">
        <div>
          <ClouderaLogo href="/" size="sm" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-cloudera-orange">
            Manager console
          </p>
          <h1 className="text-3xl font-bold text-cloudera-charcoal">{game.name}</h1>
          <p className="text-sm text-body-muted">
            Status:{" "}
            <span className="font-semibold uppercase tracking-wide text-cloudera-orange">
              {game.status}
            </span>
            · Geofence {game.geofenceRadiusM}m · Start balance £{game.startingBalance}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {game.status !== "ACTIVE" && (
            <button
              type="button"
              onClick={() => setGameStatus("ACTIVE")}
              className="btn-primary rounded-xl px-4 py-2 text-sm"
            >
              Start run
            </button>
          )}
          {game.status === "ACTIVE" && (
            <button
              type="button"
              onClick={() => setGameStatus("FINISHED")}
              className="btn-primary rounded-xl px-4 py-2 text-sm"
            >
              End run &amp; show final scores
            </button>
          )}
          <button type="button" onClick={logout} className="btn-secondary rounded-xl px-4 py-2 text-sm">
            Log out
          </button>
        </div>
      </header>

      <section className="board-card board-card-accent mb-6 rounded-2xl p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-cloudera-charcoal">Live map</h2>
            <p className="text-sm text-body-muted">
              Coloured dots are Monopoly properties; larger circles are team leaders&apos; latest GPS
              positions (updates when teams are logged in on mobile).
            </p>
          </div>
          <p className="text-xs text-body-muted">
            {mapTeams.length} team{mapTeams.length === 1 ? "" : "s"} on map · {mapProperties.length}{" "}
            properties
          </p>
        </div>
        <RunMapLazy properties={mapProperties} teams={mapTeams} heightClassName="h-80 md:h-[28rem]" />
        {teamsWithoutLocation.length > 0 && (
          <p className="mt-3 text-xs text-cloudera-orange">
            No GPS yet:{" "}
            {teamsWithoutLocation.map((t) => `${t.name} (${t.leaderName})`).join(", ")}. Team leaders
            must open the team app, allow location, and see a GPS lock — then refresh every ~12s.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="board-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-cloudera-charcoal">Create team</h2>
          <form onSubmit={createTeam} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Team name"
              className="input-field py-2 text-sm"
              value={teamForm.name}
              onChange={(e) => setTeamForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              placeholder="Leader name"
              className="input-field py-2 text-sm"
              value={teamForm.leaderName}
              onChange={(e) => setTeamForm((f) => ({ ...f, leaderName: e.target.value }))}
              required
            />
            <input
              placeholder="4–12 digit PIN"
              className="input-field py-2 text-sm sm:col-span-2"
              value={teamForm.pin}
              onChange={(e) => setTeamForm((f) => ({ ...f, pin: e.target.value }))}
              pattern="\d{4,12}"
              required
            />
            <button
              type="submit"
              disabled={busy || game.status === "FINISHED"}
              className="btn-primary rounded-xl py-2 text-sm sm:col-span-2 disabled:opacity-50"
            >
              Add team
            </button>
          </form>
          <ul className="mt-6 space-y-2">
            {game.teams.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-cloudera-border bg-cloudera-muted/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-cloudera-charcoal">{t.name}</p>
                  <p className="text-body-muted">Leader: {t.leaderName} · £{t.balance}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeTeam(t.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="board-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-cloudera-charcoal">
            {game.status === "FINISHED" ? "Final scores" : "Live leaderboard"}
          </h2>
          <ol className="mt-4 space-y-2">
            {leaderboard.map((t, i) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-cloudera-border bg-cloudera-muted/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cloudera-orange-soft text-sm font-bold text-cloudera-orange">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-cloudera-charcoal">{t.name}</p>
                    <p className="text-xs text-body-muted">
                      {t.propertiesOwned} properties · {t.leaderName}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-cloudera-orange">£{t.balance}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="board-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-cloudera-charcoal">Property map</h2>
          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto text-sm">
            {game.ownerships.length === 0 && (
              <p className="text-body-muted">No properties purchased yet.</p>
            )}
            {game.ownerships.map((o) => {
              const style = COLOR_GROUP_STYLES[o.location.colorGroup];
              return (
                <li
                  key={o.id}
                  className="flex items-center gap-3 rounded-xl border border-cloudera-border bg-white p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={o.selfiePath}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-cloudera-charcoal">{o.location.name}</p>
                    <p className="text-xs text-body-muted">Owned by {o.team.name}</p>
                  </div>
                  <span className={`ml-auto rounded px-2 py-0.5 text-xs text-white ${style?.bg ?? "bg-zinc-500"}`}>
                    {style?.label ?? o.location.colorGroup}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="board-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-cloudera-charcoal">Recent activity</h2>
          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto text-sm">
            {game.visits.map((v) => (
              <li
                key={v.id}
                className="rounded-xl border border-cloudera-border bg-cloudera-muted/40 px-3 py-2"
              >
                <span className="font-medium text-cloudera-charcoal">{v.team.name}</span> —{" "}
                {v.visitType.toLowerCase()}{" "}
                <span className="text-cloudera-orange">{v.location.name}</span>
                {v.amount > 0 && <span> (£{v.amount})</span>}
                <span className="block text-xs text-body-muted">
                  {new Date(v.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
