"use client";

import { COLOR_GROUP_STYLES } from "@/lib/locations-data";
import type { MapPropertyMarker, MapTeamMarker } from "@/lib/map-types";
import { TEAM_MARKER_COLORS } from "@/lib/map-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

const LONDON_CENTER: [number, number] = [51.5074, -0.1278];

const GROUP_PIN_COLORS: Record<string, string> = {
  brown: "#78350f",
  "light-blue": "#38bdf8",
  pink: "#f472b6",
  orange: "#f97316",
  red: "#dc2626",
  yellow: "#facc15",
  green: "#059669",
  "dark-blue": "#1e3a8a",
};

type Props = {
  properties: MapPropertyMarker[];
  teams: MapTeamMarker[];
  className?: string;
  heightClassName?: string;
};

/** Fit the map once on load so polling updates do not reset the user’s zoom. */
function FitBoundsOnce({ points }: { points: [number, number][] }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (hasFitted.current) return;
    if (points.length === 0) return;

    hasFitted.current = true;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 15 });
  }, [map, points]);

  useEffect(() => {
    if (points.length > 0) return;
    if (hasFitted.current) return;
    hasFitted.current = true;
    map.setView(LONDON_CENTER, 13);
  }, [map, points.length]);

  return null;
}

function teamColor(teamId: string, teams: MapTeamMarker[]) {
  const idx = teams.findIndex((t) => t.id === teamId);
  return TEAM_MARKER_COLORS[(idx >= 0 ? idx : 0) % TEAM_MARKER_COLORS.length];
}

export function RunMap({
  properties,
  teams,
  className = "",
  heightClassName = "h-72 md:h-96",
}: Props) {
  const boundsPoints = useMemo(() => {
    const pts: [number, number][] = properties.map((p) => [p.latitude, p.longitude]);
    for (const t of teams) {
      pts.push([t.latitude, t.longitude]);
    }
    return pts;
  }, [properties, teams]);

  const boundsKey = useMemo(
    () => `${properties.length}:${properties[0]?.id ?? ""}`,
    [properties],
  );

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-cloudera-border ${className}`}
      style={{ minHeight: "18rem" }}
    >
      <MapContainer
        key={boundsKey}
        center={LONDON_CENTER}
        zoom={13}
        scrollWheelZoom
        className={`${heightClassName} w-full z-0`}
        style={{ minHeight: "18rem", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBoundsOnce points={boundsPoints} />

        {properties.map((p) => {
          const fill = GROUP_PIN_COLORS[p.colorGroup] ?? "#64748b";
          const label = COLOR_GROUP_STYLES[p.colorGroup]?.label ?? p.colorGroup;
          return (
            <CircleMarker
              key={`prop-${p.id}`}
              center={[p.latitude, p.longitude]}
              radius={p.ownerName ? 9 : 7}
              pathOptions={{
                color: "#fef3c7",
                weight: 2,
                fillColor: fill,
                fillOpacity: 0.95,
              }}
            >
              <Popup>
                <div className="text-sm text-slate-900">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-slate-600">{label}</p>
                  {p.price != null && <p className="text-xs">Buy £{p.price}</p>}
                  <p className="text-xs">
                    {p.ownerName ? `Owned by ${p.ownerName}` : "Unowned"}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {teams.map((t) => (
          <TeamMarker key={`team-${t.id}`} team={t} teams={teams} />
        ))}
      </MapContainer>
    </div>
  );
}

function TeamMarker({ team: t, teams }: { team: MapTeamMarker; teams: MapTeamMarker[] }) {
  const color = t.isSelf ? "#C2410C" : teamColor(t.id, teams);
  return (
    <CircleMarker
      center={[t.latitude, t.longitude]}
      radius={t.isSelf ? 11 : 9}
      pathOptions={{
        color: "#0f172a",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      }}
    >
      <Popup>
        <div className="text-sm text-slate-900">
          <p className="font-semibold">{t.name}</p>
          {t.leaderName && <p className="text-xs">Leader: {t.leaderName}</p>}
          {t.isSelf && <p className="text-xs font-bold text-[#7C2D12]">Your team</p>}
          {t.updatedAt && (
            <p className="text-xs text-slate-500">
              Updated {new Date(t.updatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </Popup>
    </CircleMarker>
  );
}
