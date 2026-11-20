"use client";

import dynamic from "next/dynamic";
import type { MapPropertyMarker, MapTeamMarker } from "@/lib/map-types";

const RunMap = dynamic(() => import("./RunMap").then((m) => m.RunMap), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full min-h-[16rem] items-center justify-center rounded-2xl border border-cloudera-border bg-cloudera-muted text-sm font-medium text-cloudera-gray"
    >
      Loading map…
    </div>
  ),
});

type Props = {
  properties: MapPropertyMarker[];
  teams: MapTeamMarker[];
  /** Check-in distance in metres. Each property is ringed with a circle of this radius. */
  geofenceRadiusM?: number;
  frame?: "board" | "everyone";
  onMapClick?: (latitude: number, longitude: number) => void;
  className?: string;
  heightClassName?: string;
};

export function RunMapLazy({ heightClassName = "h-72 md:h-96", ...props }: Props) {
  return (
    <div className={heightClassName} style={{ minHeight: "16rem" }}>
      <RunMap {...props} heightClassName="h-full" />
    </div>
  );
}
