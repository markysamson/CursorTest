"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ClouderaLogo } from "@/components/brand/ClouderaLogo";

type GameConfig = {
  id: string;
  name: string;
  status: string;
  geofenceRadiusM: number;
  showTeamMap: boolean;
};

export default function AdminConfigPage() {
  const router = useRouter();
  const [game, setGame] = useState<GameConfig | null>(null);
  const [geofenceRadiusM, setGeofenceRadiusM] = useState(100);
  const [showTeamMap, setShowTeamMap] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/game");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!res.ok) return;
    const { game: g } = (await res.json()) as { game: GameConfig | null };
    if (g) {
      setGame(g);
      setGeofenceRadiusM(g.geofenceRadiusM);
      setShowTeamMap(g.showTeamMap);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/game", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ geofenceRadiusM, showTeamMap }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMessage(j.error ?? "Could not save settings");
      return;
    }
    setMessage("Settings saved.");
    void load();
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg bg-white px-4 py-8">
      <ClouderaLogo href="/admin" size="sm" />
      <h1 className="mt-4 text-2xl font-bold text-cloudera-navy">Run settings</h1>
      <p className="mt-1 text-sm text-cloudera-gray">
        {game ? (
          <>
            Current run: <strong>{game.name}</strong> ({game.status})
          </>
        ) : (
          "No game yet — create one from the manager console."
        )}
      </p>

      <form onSubmit={save} className="board-card mt-6 space-y-6 rounded-2xl p-6">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block font-semibold text-cloudera-navy">Show map on team app</span>
            <span className="text-xs text-cloudera-gray">
              When off, teams still see the landmark list and GPS check-in.
            </span>
          </span>
          <input
            type="checkbox"
            checked={showTeamMap}
            onChange={(e) => setShowTeamMap(e.target.checked)}
            className="h-5 w-5 accent-cloudera-orange-dark"
          />
        </label>

        <div>
          <label htmlFor="geofence" className="block font-semibold text-cloudera-navy">
            GPS check-in range (metres)
          </label>
          <p className="text-xs text-cloudera-gray">
            Teams must be within this distance of a landmark to buy or pay rent.
          </p>
          <input
            id="geofence"
            type="number"
            min={30}
            max={500}
            value={geofenceRadiusM}
            onChange={(e) => setGeofenceRadiusM(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-cloudera-border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={busy || !game}
          className="btn-primary w-full rounded-xl py-2.5 text-sm disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
        {message && <p className="text-sm font-medium text-cloudera-navy">{message}</p>}
      </form>

      <p className="mt-6 flex flex-col items-center gap-2 text-center text-sm">
        <Link href="/rules" className="font-semibold text-cloudera-orange-dark underline">
          Game rules
        </Link>
        <Link href="/admin" className="font-semibold text-cloudera-orange-dark underline">
          Back to manager console
        </Link>
      </p>
    </main>
  );
}
