"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ClouderaLogo } from "@/components/brand/ClouderaLogo";
import { RunMapLazy } from "@/components/maps/RunMapLazy";
import { BOARD_SET_CONFIG, getBoardSetConfig, normalizeBoardSet, type BoardSetId } from "@/lib/board-sets";
import { COLOR_GROUP_STYLES } from "@/lib/locations-data";
import type { MapPropertyMarker, MapTeamMarker } from "@/lib/map-types";

type Team = { id: string; name: string; leaderName: string; balance: number };
type Game = {
  id: string;
  name: string;
  boardSet: BoardSetId;
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
  const [newGameBoard, setNewGameBoard] = useState<BoardSetId>("LONDON_FULL");

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

  async function createNewGame() {
    if (!confirm("Start a fresh game? Final scores for this run stay in the history below.")) {
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardSet: newGameBoard }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Could not create game");
      return;
    }
    load();
  }

  async function setBoardSet(boardSet: BoardSetId) {
    const res = await fetch("/api/admin/game", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardSet }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Could not change board");
      return;
    }
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
      <main className="flex min-h-screen items-center justify-center font-medium text-cloudera-gray">
        {error ?? "Loading manager console…"}
      </main>
    );
  }

  const { game, leaderboard, mapProperties, mapTeams, teamsWithoutLocation } = data;
  const boardSet = normalizeBoardSet(game.boardSet);
  const boardCfg = getBoardSetConfig(boardSet);

  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-white px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-cloudera-border pb-6">
        <div>
          <ClouderaLogo href="/" size="sm" />
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-cloudera-blue">
            Manager console
          </p>
          <h1 className="text-3xl font-bold text-cloudera-navy">{game.name}</h1>
          <p className="text-sm font-medium text-cloudera-gray">
            Status:{" "}
            <span className="font-bold uppercase tracking-wide text-cloudera-orange-dark">
              {game.status}
            </span>
            · Board:{" "}
            <span className="font-semibold text-cloudera-navy">{boardCfg.label}</span>
            · Geofence {game.geofenceRadiusM}m · Start balance £{game.startingBalance}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {game.status === "SETUP" && (
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
          {game.status === "FINISHED" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void createNewGame()}
              className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-60"
            >
              Create new game
            </button>
          )}
          <button type="button" onClick={logout} className="btn-secondary rounded-xl px-4 py-2 text-sm">
            Log out
          </button>
        </div>
      </header>

      {game.status === "FINISHED" && (
        <section className="board-card mb-6 rounded-2xl border-cloudera-blue/30 bg-cloudera-blue-soft p-6">
          <h2 className="text-lg font-bold text-cloudera-navy">Run complete</h2>
          <p className="mt-1 text-sm font-medium text-cloudera-gray">
            Final scores are below. Choose a board for the next run, then create a new game to add teams
            and start again.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(Object.keys(BOARD_SET_CONFIG) as BoardSetId[]).map((id) => {
              const cfg = BOARD_SET_CONFIG[id];
              const selected = newGameBoard === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setNewGameBoard(id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-cloudera-orange bg-white ring-2 ring-cloudera-orange/30"
                      : "border-cloudera-border bg-white/80 hover:border-cloudera-blue"
                  }`}
                >
                  <p className="font-bold text-cloudera-navy">{cfg.label}</p>
                  <p className="mt-1 text-sm font-medium text-cloudera-gray">{cfg.subtitle}</p>
                  <p className="mt-2 text-xs font-semibold text-cloudera-orange-dark">
                    {cfg.stopCount} stops · {cfg.suggestedDuration}
                  </p>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void createNewGame()}
            className="btn-primary mt-4 rounded-xl px-5 py-2.5 text-sm disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create new game with selected board"}
          </button>
        </section>
      )}

      {game.status === "SETUP" && (
        <section className="board-card mb-6 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-cloudera-navy">Choose board</h2>
          <p className="mt-1 text-sm font-medium text-cloudera-gray">
            Pick the route before you start the run. Teams will only see stops on the selected board.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(Object.keys(BOARD_SET_CONFIG) as BoardSetId[]).map((id) => {
              const cfg = BOARD_SET_CONFIG[id];
              const selected = boardSet === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBoardSet(id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-cloudera-orange bg-cloudera-orange-soft ring-2 ring-cloudera-orange/30"
                      : "border-cloudera-border bg-white hover:border-cloudera-blue"
                  }`}
                >
                  <p className="font-bold text-cloudera-navy">{cfg.label}</p>
                  <p className="mt-1 text-sm font-medium text-cloudera-gray">{cfg.subtitle}</p>
                  <p className="mt-2 text-xs font-semibold text-cloudera-orange-dark">
                    {cfg.stopCount} stops · {cfg.suggestedDuration} · £{cfg.startingBalance} start ·{" "}
                    {cfg.geofenceRadiusM}m geofence
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="board-card board-card-accent mb-6 rounded-2xl p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-cloudera-navy">Live map</h2>
            <p className="text-sm font-medium text-cloudera-gray">
              Coloured dots are Monopoly properties; larger circles are team leaders&apos; latest GPS
              positions (updates when teams are logged in on mobile).
            </p>
          </div>
          <p className="text-xs font-medium text-cloudera-gray">
            {mapTeams.length} team{mapTeams.length === 1 ? "" : "s"} on map · {mapProperties.length}{" "}
            properties
          </p>
        </div>
        <RunMapLazy properties={mapProperties} teams={mapTeams} heightClassName="h-80 md:h-[28rem]" />
        {teamsWithoutLocation.length > 0 && (
          <p className="mt-3 text-xs font-semibold text-cloudera-orange-dark">
            No GPS yet:{" "}
            {teamsWithoutLocation.map((t) => `${t.name} (${t.leaderName})`).join(", ")}. Team leaders
            must open the team app, allow location, and see a GPS lock — then refresh every ~12s.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="board-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-cloudera-navy">
            {game.status === "FINISHED" ? "Teams (final run)" : "Create team"}
          </h2>
          {game.status === "FINISHED" && (
            <p className="mt-1 text-sm font-medium text-cloudera-gray">
              Create a new game above to register teams for the next run.
            </p>
          )}
          {game.status !== "FINISHED" && (
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
              disabled={busy}
              className="btn-primary rounded-xl py-2 text-sm sm:col-span-2 disabled:opacity-50"
            >
              Add team
            </button>
          </form>
          )}
          <ul className="mt-6 space-y-2">
            {game.teams.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-cloudera-border bg-cloudera-muted/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-cloudera-navy">{t.name}</p>
                  <p className="font-medium text-cloudera-gray">Leader: {t.leaderName} · £{t.balance}</p>
                </div>
                {game.status !== "FINISHED" && (
                  <button
                    type="button"
                    onClick={() => removeTeam(t.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="board-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-cloudera-navy">
            {game.status === "FINISHED" ? "Final scores" : "Live leaderboard"}
          </h2>
          <ol className="mt-4 space-y-2">
            {leaderboard.map((t, i) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-cloudera-border bg-cloudera-muted/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cloudera-blue-soft text-sm font-bold text-cloudera-navy">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-cloudera-navy">{t.name}</p>
                    <p className="text-xs font-medium text-cloudera-gray">
                      {t.propertiesOwned} properties · {t.leaderName}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-cloudera-orange-dark">£{t.balance}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="board-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-cloudera-navy">Property map</h2>
          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto text-sm">
            {game.ownerships.length === 0 && (
              <p className="font-medium text-cloudera-gray">No properties purchased yet.</p>
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
                    <p className="font-semibold text-cloudera-navy">{o.location.name}</p>
                    <p className="text-xs font-medium text-cloudera-gray">Owned by {o.team.name}</p>
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
          <h2 className="text-lg font-bold text-cloudera-navy">Recent activity</h2>
          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto text-sm">
            {game.visits.map((v) => (
              <li
                key={v.id}
                className="rounded-xl border border-cloudera-border bg-cloudera-muted/40 px-3 py-2"
              >
                <span className="font-semibold text-cloudera-navy">{v.team.name}</span> —{" "}
                {v.visitType.toLowerCase()}{" "}
                <span className="font-medium text-cloudera-orange-dark">{v.location.name}</span>
                {v.amount > 0 && <span> (£{v.amount})</span>}
                <span className="block text-xs font-medium text-cloudera-gray">
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
