"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClouderaLogo } from "@/components/brand/ClouderaLogo";
import { LandmarkPhoto } from "@/components/LandmarkPhoto";
import { PropertyEditor } from "@/components/admin/PropertyEditor";
import type { AdminLocation, PlaceSuggestion } from "@/lib/admin-location-types";
import { BOARD_SET_CONFIG, BOARD_SET_IDS, type BoardSetId } from "@/lib/board-sets";
import { distanceMeters } from "@/lib/geo";
import { landmarkImageProxyUrl } from "@/lib/landmark-image-url";
import { COLOR_GROUP_STYLES } from "@/lib/locations-data";

const FALLBACK_CENTER = { latitude: 51.5074, longitude: -0.1278 };
const MATCH_THRESHOLD_M = 30;
const BULK_DELAY_MS = 1200;

type Editing = { mode: "create" } | { mode: "edit"; id: string };

type Review =
  | { state: "none" }
  | { state: "match"; suggestion: PlaceSuggestion }
  | { state: "proposal"; suggestion: PlaceSuggestion };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatDistance(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m} m`;
}

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [board, setBoard] = useState<BoardSetId>("LONDON_FULL");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const cancelBulk = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/locations");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as { locations: AdminLocation[] };
    setLocations(data.locations);
    setLoaded(true);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/locations").then(async (res) => {
      if (cancelled) return;
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { locations: AdminLocation[] };
      if (!cancelled) {
        setLocations(data.locations);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/game")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { game?: { boardSet?: string } | null } | null) => {
        const id = data?.game?.boardSet;
        if (!cancelled && id && (BOARD_SET_IDS as readonly string[]).includes(id)) {
          setBoard(id as BoardSetId);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      cancelBulk.current = true;
    };
  }, []);

  const boardLocations = useMemo(
    () => locations.filter((l) => l.boardSet === board).sort((a, b) => a.boardOrder - b.boardOrder),
    [locations, board],
  );

  const counts = useMemo(() => {
    const result = {} as Record<BoardSetId, { total: number; verified: number }>;
    for (const id of BOARD_SET_IDS) result[id] = { total: 0, verified: 0 };
    for (const l of locations) {
      result[l.boardSet].total += 1;
      if (l.verified) result[l.boardSet].verified += 1;
    }
    return result;
  }, [locations]);

  const defaultCenter = useMemo(() => {
    if (boardLocations.length === 0) return FALLBACK_CENTER;
    return {
      latitude: boardLocations.reduce((sum, l) => sum + l.latitude, 0) / boardLocations.length,
      longitude: boardLocations.reduce((sum, l) => sum + l.longitude, 0) / boardLocations.length,
    };
  }, [boardLocations]);

  const editingLocation =
    editing?.mode === "edit" ? locations.find((l) => l.id === editing.id) : undefined;

  async function patch(id: string, body: Record<string, unknown>): Promise<boolean> {
    const res = await fetch(`/api/admin/locations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setMessage(j.error ?? "Could not update property.");
      return false;
    }
    return true;
  }

  async function applyReview(loc: AdminLocation, suggestion: PlaceSuggestion, withPhoto: boolean) {
    const ok = await patch(loc.id, {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      wikidataId: suggestion.id,
      verified: true,
      ...(withPhoto && suggestion.imageFile ? { commonsFile: suggestion.imageFile } : {}),
    });
    if (ok) {
      setReviews((r) => ({ ...r, [loc.id]: { state: "none" } }));
      setMessage(`Updated "${loc.name}" from Wikidata.`);
      await load();
    }
  }

  async function markVerified(loc: AdminLocation, suggestion?: PlaceSuggestion) {
    const ok = await patch(loc.id, {
      verified: true,
      ...(suggestion ? { wikidataId: suggestion.id } : {}),
    });
    if (ok) {
      setReviews((r) => ({ ...r, [loc.id]: { state: "none" } }));
      await load();
    }
  }

  async function checkOne(loc: AdminLocation): Promise<Review> {
    const params = new URLSearchParams({
      q: loc.name,
      lat: String(loc.latitude),
      lng: String(loc.longitude),
    });
    const res = await fetch(`/api/admin/locations/suggest?${params}`);
    if (!res.ok) throw new Error("lookup failed");
    const { suggestions } = (await res.json()) as { suggestions: PlaceSuggestion[] };
    const top = suggestions[0];
    if (!top) return { state: "none" };
    const dist =
      top.distanceM ??
      Math.round(distanceMeters(loc.latitude, loc.longitude, top.latitude, top.longitude));
    return dist <= MATCH_THRESHOLD_M
      ? { state: "match", suggestion: top }
      : { state: "proposal", suggestion: top };
  }

  async function checkBoard() {
    const targets = boardLocations.filter((l) => !l.verified);
    if (targets.length === 0) {
      setMessage("Every property on this board is already verified.");
      return;
    }
    cancelBulk.current = false;
    setMessage(null);
    setBulkProgress({ done: 0, total: targets.length });
    let failures = 0;
    for (let i = 0; i < targets.length; i++) {
      if (cancelBulk.current) break;
      try {
        const review = await checkOne(targets[i]);
        setReviews((r) => ({ ...r, [targets[i].id]: review }));
      } catch {
        failures += 1;
      }
      setBulkProgress({ done: i + 1, total: targets.length });
      await sleep(BULK_DELAY_MS);
    }
    setBulkProgress(null);
    setMessage(
      failures > 0
        ? `Check finished, but ${failures} lookup(s) failed (Wikidata may be rate-limiting). Run it again to retry.`
        : "Check finished. Review each suggestion below before applying it.",
    );
  }

  const unverifiedCount = boardLocations.filter((l) => !l.verified).length;

  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-white px-4 py-8">
      <ClouderaLogo href="/admin" size="sm" />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-cloudera-navy">Properties</h1>
          <p className="mt-1 max-w-xl text-sm text-cloudera-gray">
            Fix names, positions and photos, or add and remove properties. Changes reach teams
            immediately, including during a live run.
          </p>
        </div>
        <div className="flex gap-3 text-sm font-semibold">
          <Link href="/admin" className="text-cloudera-orange-dark underline">
            Manager console
          </Link>
          <Link href="/rules" className="text-cloudera-orange-dark underline">
            Rules
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {BOARD_SET_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setBoard(id)}
            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
              board === id
                ? "border-cloudera-orange bg-cloudera-orange-soft ring-2 ring-cloudera-orange/30"
                : "border-cloudera-border bg-white hover:border-cloudera-blue"
            }`}
          >
            <span className="block font-bold text-cloudera-navy">{BOARD_SET_CONFIG[id].label}</span>
            <span className="text-xs font-medium text-cloudera-gray">
              {counts[id].total} properties · {counts[id].verified} verified
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing({ mode: "create" })}
          className="btn-primary rounded-xl px-4 py-2 text-sm"
        >
          Add property
        </button>
        {bulkProgress ? (
          <>
            <span className="text-sm font-medium text-cloudera-navy">
              Checking Wikidata… {bulkProgress.done}/{bulkProgress.total}
            </span>
            <button
              type="button"
              onClick={() => {
                cancelBulk.current = true;
              }}
              className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Stop
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => void checkBoard()}
            disabled={unverifiedCount === 0}
            className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            Check unverified against Wikidata ({unverifiedCount})
          </button>
        )}
      </div>
      {message && <p className="mt-3 text-sm font-medium text-cloudera-navy">{message}</p>}

      {!loaded ? (
        <p className="mt-6 text-sm text-cloudera-gray">Loading…</p>
      ) : boardLocations.length === 0 ? (
        <p className="mt-6 rounded-xl border border-cloudera-border p-4 text-sm text-cloudera-gray">
          This board has no properties yet. Add some to make it playable.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {boardLocations.map((loc) => {
            const style = COLOR_GROUP_STYLES[loc.colorGroup];
            const review = reviews[loc.id] ?? { state: "none" as const };
            const dist =
              review.state === "proposal"
                ? Math.round(
                    distanceMeters(
                      loc.latitude,
                      loc.longitude,
                      review.suggestion.latitude,
                      review.suggestion.longitude,
                    ),
                  )
                : 0;
            return (
              <li key={loc.id} className="board-card rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <LandmarkPhoto
                    name={loc.name}
                    imageUrl={loc.landmarkImageUrl ? landmarkImageProxyUrl(loc.id, loc.photoRev) : null}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-cloudera-navy">{loc.name}</p>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-cloudera-gray">
                      <span
                        className={`inline-block h-3 w-3 rounded-full border ${style?.bg ?? ""} ${style?.border ?? ""}`}
                        aria-hidden
                      />
                      {style?.label ?? loc.colorGroup} · £{loc.price} · rent £{loc.rent} ·{" "}
                      {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        loc.verified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {loc.verified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing({ mode: "edit", id: loc.id })}
                    className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold"
                  >
                    Edit
                  </button>
                </div>

                {review.state === "match" && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                    <span>
                      Location matches Wikidata &ldquo;{review.suggestion.label}&rdquo; (within{" "}
                      {MATCH_THRESHOLD_M} m).
                    </span>
                    <button
                      type="button"
                      onClick={() => void markVerified(loc, review.suggestion)}
                      className="rounded-lg border border-emerald-400 bg-white px-3 py-1 text-xs font-semibold"
                    >
                      Mark verified
                    </button>
                  </div>
                )}
                {review.state === "proposal" && (
                  <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                    <p>
                      Wikidata: <strong>{review.suggestion.label}</strong>
                      {review.suggestion.description ? ` — ${review.suggestion.description}` : ""}.{" "}
                      {formatDistance(dist)} from the current pin
                      {review.suggestion.imageFile ? ", has a photo" : ", no photo"}.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void applyReview(loc, review.suggestion, false)}
                        className="rounded-lg border border-amber-400 bg-white px-3 py-1 text-xs font-semibold"
                      >
                        Use location
                      </button>
                      {review.suggestion.imageFile && (
                        <button
                          type="button"
                          onClick={() => void applyReview(loc, review.suggestion, true)}
                          className="rounded-lg border border-amber-400 bg-white px-3 py-1 text-xs font-semibold"
                        >
                          Use location + photo
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setReviews((r) => ({ ...r, [loc.id]: { state: "none" } }))}
                        className="rounded-lg border border-amber-400 bg-white px-3 py-1 text-xs font-semibold"
                      >
                        Skip
                      </button>
                      <a
                        href={`https://www.wikidata.org/wiki/${review.suggestion.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-1 py-1 text-xs font-semibold underline"
                      >
                        View on Wikidata
                      </a>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {editing && (editing.mode === "create" || editingLocation) && (
        <PropertyEditor
          key={editing.mode === "edit" ? editing.id : "new"}
          mode={editing.mode}
          boardSet={board}
          location={editingLocation}
          neighbours={boardLocations}
          defaultCenter={defaultCenter}
          onClose={() => setEditing(null)}
          onSaved={() => void load()}
        />
      )}
    </main>
  );
}
