"use client";

import { PhotoLightbox, type LightboxItem } from "@/components/admin/PhotoLightbox";
import type { SelfieItem, SelfieKind } from "@/lib/selfies";
import { useEffect, useMemo, useState } from "react";

type TeamRef = { id: string; name: string };

const KIND_FILTERS: { id: "ALL" | SelfieKind; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "PURCHASE", label: "Bought" },
  { id: "RENT", label: "Rent" },
  { id: "PASS", label: "Passed" },
  { id: "CHANCE", label: "Chance cards" },
];

const KIND_BADGE: Record<SelfieKind, string> = {
  PURCHASE: "bg-emerald-600 text-white",
  RENT: "bg-red-600 text-white",
  PASS: "bg-slate-600 text-white",
  CHANCE: "bg-cloudera-orange text-white",
};

const KIND_NAME: Record<SelfieKind, string> = {
  PURCHASE: "Bought",
  RENT: "Rent",
  PASS: "Passed",
  CHANCE: "Chance",
};

function toLightbox(item: SelfieItem): LightboxItem {
  return {
    src: item.selfiePath,
    title: item.title,
    subtitle: `${item.teamName} · ${item.detail} · ${new Date(item.createdAt).toLocaleString()}`,
  };
}

export function SelfieGallery({ teams }: { teams: TeamRef[] }) {
  const [items, setItems] = useState<SelfieItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string>("ALL");
  const [kind, setKind] = useState<"ALL" | SelfieKind>("ALL");
  const [lightbox, setLightbox] = useState<{ items: LightboxItem[]; index: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/admin/selfies");
      if (cancelled) return;
      if (!res.ok) {
        setError("Could not load selfies.");
        return;
      }
      const body = (await res.json()) as { items: SelfieItem[] };
      setError(null);
      setItems(body.items);
    }
    const boot = window.setTimeout(() => void load(), 0);
    const t = window.setInterval(() => void load(), 20000);
    return () => {
      cancelled = true;
      window.clearTimeout(boot);
      window.clearInterval(t);
    };
  }, []);

  const counts = useMemo(() => {
    const byTeam = new Map<string, number>();
    for (const item of items ?? []) byTeam.set(item.teamId, (byTeam.get(item.teamId) ?? 0) + 1);
    return byTeam;
  }, [items]);

  const visible = useMemo(
    () =>
      (items ?? []).filter(
        (item) => (teamId === "ALL" || item.teamId === teamId) && (kind === "ALL" || item.kind === kind),
      ),
    [items, teamId, kind],
  );

  const groups = useMemo(() => {
    if (teamId !== "ALL") {
      const name = teams.find((t) => t.id === teamId)?.name ?? "Team";
      return [{ id: teamId, name, items: visible }];
    }
    const map = new Map<string, { id: string; name: string; items: SelfieItem[] }>();
    for (const item of visible) {
      const group = map.get(item.teamId) ?? { id: item.teamId, name: item.teamName, items: [] };
      group.items.push(item);
      map.set(item.teamId, group);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [visible, teamId, teams]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  function open(item: SelfieItem) {
    setLightbox({ items: flat.map(toLightbox), index: flat.findIndex((i) => i.id === item.id) });
  }

  const total = items?.length ?? 0;
  const selectedTeam = teams.find((t) => t.id === teamId);
  const downloadHref =
    teamId === "ALL" ? "/api/admin/selfies/download" : `/api/admin/selfies/download?teamId=${teamId}`;

  return (
    <section className="board-card mt-6 rounded-2xl p-6" aria-label="Selfie gallery">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-cloudera-navy">Selfie gallery</h2>
          <p className="text-sm font-medium text-cloudera-gray">
            Every team photo from the run: purchases, rent, passes and Chance cards. Click one to see it
            larger.
          </p>
        </div>
        {total > 0 && (
          <a
            href={downloadHref}
            download
            className="btn-primary rounded-xl px-4 py-2 text-sm"
          >
            {selectedTeam ? `Download ${selectedTeam.name} (.zip)` : `Download all ${total} (.zip)`}
          </a>
        )}
      </div>
      {total > 0 && (
        <p className="mt-1 text-xs font-medium text-cloudera-gray">
          The zip has the photos oldest first, named so a slideshow plays them in order, plus a
          captions.csv.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by team">
        {[{ id: "ALL", name: "All teams" }, ...teams].map((t) => {
          const selected = teamId === t.id;
          const n = t.id === "ALL" ? total : (counts.get(t.id) ?? 0);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTeamId(t.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                selected
                  ? "border-cloudera-orange bg-cloudera-orange-soft text-cloudera-navy"
                  : "border-cloudera-border bg-white text-cloudera-navy hover:border-cloudera-blue"
              }`}
            >
              {t.name} ({n})
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        {KIND_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setKind(f.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              kind === f.id
                ? "bg-cloudera-navy text-white"
                : "bg-cloudera-muted text-cloudera-navy hover:bg-cloudera-blue-soft"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm font-medium text-red-700">{error}</p>}
      {items === null && !error && (
        <p className="mt-4 text-sm font-medium text-cloudera-gray">Loading selfies…</p>
      )}
      {items !== null && flat.length === 0 && (
        <p className="mt-4 text-sm font-medium text-cloudera-gray">
          {total === 0 ? "No selfies yet. They appear here as teams check in." : "No selfies match those filters."}
        </p>
      )}

      <div className="mt-4 space-y-6">
        {groups
          .filter((g) => g.items.length > 0)
          .map((group) => (
            <div key={group.id}>
              {teamId === "ALL" && (
                <h3 className="mb-2 text-sm font-bold text-cloudera-navy">
                  {group.name}{" "}
                  <span className="font-medium text-cloudera-gray">({group.items.length})</span>
                </h3>
              )}
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => open(item)}
                      className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-cloudera-border bg-cloudera-muted text-left"
                      aria-label={`${item.title}, ${item.teamName}. View larger`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.selfiePath}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                      <span
                        className={`absolute left-1.5 top-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${KIND_BADGE[item.kind]}`}
                      >
                        {KIND_NAME[item.kind]}
                        {item.kind === "CHANCE" && item.status === "PENDING" ? " · review" : ""}
                        {item.kind === "CHANCE" && item.status === "REJECTED" ? " · rejected" : ""}
                      </span>
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 text-xs font-semibold text-white">
                        <span className="line-clamp-2">{item.title}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>

      {lightbox && (
        <PhotoLightbox
          items={lightbox.items}
          index={lightbox.index}
          onIndex={(index) => setLightbox((prev) => (prev ? { ...prev, index } : prev))}
          onClose={() => setLightbox(null)}
        />
      )}
    </section>
  );
}
