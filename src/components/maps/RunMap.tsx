"use client";

import { COLOR_GROUP_STYLES } from "@/lib/locations-data";
import type { MapPropertyMarker, MapTeamMarker } from "@/lib/map-types";
import { TEAM_MARKER_COLORS } from "@/lib/map-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Fragment, useEffect, useMemo, useRef } from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

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
  /** Check-in distance in metres. Each property is ringed with a circle of this radius. */
  geofenceRadiusM?: number;
  /**
   * `board` frames every property (and its check-in circle) and ignores team positions.
   * `everyone` frames properties and teams. Either way, later updates do not move the view.
   */
  frame?: "board" | "everyone";
  onMapClick?: (latitude: number, longitude: number) => void;
  className?: string;
  heightClassName?: string;
};

/** Fit once on open so polling updates do not reset the user’s zoom. */
function FitBoundsOnce({
  points,
  radiusM,
}: {
  points: [number, number][];
  radiusM: number;
}) {
  const map = useMap();
  const hasFitted = useRef(false);
  const pointsKey = points.map((p) => p.join(",")).join("|");

  useEffect(() => {
    if (hasFitted.current) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || hasFitted.current) return;
      hasFitted.current = true;
      map.invalidateSize();
      if (points.length === 0) {
        map.setView(LONDON_CENTER, 13);
        return;
      }
      const bounds = L.latLngBounds(points.map(([lat, lng]) => L.latLng(lat, lng)));
      if (radiusM > 0) {
        for (const [lat, lng] of points) {
          bounds.extend(L.latLng(lat, lng).toBounds(radiusM));
        }
      }
      if (points.length === 1 && radiusM <= 0) {
        map.setView(points[0], 16);
        return;
      }
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 17 });
    }, 60);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // pointsKey stands in for the coordinate list so a new array identity does not refit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, pointsKey, radiusM]);

  return null;
}

function MapClick({ onClick }: { onClick: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click(event) {
      onClick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function teamColor(teamId: string, teams: MapTeamMarker[]) {
  const idx = teams.findIndex((t) => t.id === teamId);
  return TEAM_MARKER_COLORS[(idx >= 0 ? idx : 0) % TEAM_MARKER_COLORS.length];
}

export function RunMap({
  properties,
  teams,
  geofenceRadiusM = 0,
  frame = "everyone",
  onMapClick,
  className = "",
  heightClassName = "h-72 md:h-96",
}: Props) {
  const boundsPoints = useMemo(() => {
    const pts: [number, number][] = properties.map((p) => [p.latitude, p.longitude]);
    if (frame === "everyone") {
      for (const t of teams) {
        pts.push([t.latitude, t.longitude]);
      }
    }
    return pts;
  }, [properties, teams, frame]);

  const boundsKey = useMemo(
    () => `${properties.length}:${properties[0]?.id ?? ""}`,
    [properties],
  );

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-cloudera-border ${heightClassName} ${onMapClick ? "cursor-crosshair" : ""} ${className}`}
      style={{ minHeight: "16rem" }}
    >
      <MapContainer
        key={boundsKey}
        center={LONDON_CENTER}
        zoom={13}
        scrollWheelZoom
        className="z-0 h-full w-full"
        style={{ height: "100%", minHeight: "16rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBoundsOnce points={boundsPoints} radiusM={frame === "board" ? geofenceRadiusM : 0} />
        {onMapClick && <MapClick onClick={onMapClick} />}

        {properties.map((p) => {
          const fill = GROUP_PIN_COLORS[p.colorGroup] ?? "#64748b";
          const label = COLOR_GROUP_STYLES[p.colorGroup]?.label ?? p.colorGroup;
          return (
            <Fragment key={`prop-${p.id}`}>
              {geofenceRadiusM > 0 && (
                <Circle
                  center={[p.latitude, p.longitude]}
                  radius={geofenceRadiusM}
                  pathOptions={{
                    color: fill,
                    weight: 2,
                    fillColor: fill,
                    fillOpacity: 0.15,
                  }}
                />
              )}
              <CircleMarker
                center={[p.latitude, p.longitude]}
                radius={p.ownerName || p.possession === "owned" ? 9 : 7}
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
                    {p.price != null && <p className="text-xs">Price £{p.price}</p>}
                    {p.rent != null && <p className="text-xs">Rent £{p.rent}</p>}
                    <p className="text-xs">
                      {p.ownerName
                        ? `Owned by ${p.ownerName}`
                        : p.possession === "owned"
                          ? "Owned (your team)"
                          : p.possession === "unowned"
                            ? "Unowned"
                            : "Unowned"}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            </Fragment>
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
