"use client";

import dynamic from "next/dynamic";
import type { MapPropertyMarker, MapTeamMarker } from "@/lib/map-types";

const RunMap = dynamic(() => import("./RunMap").then((m) => m.RunMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-2xl border border-cloudera-border bg-cloudera-muted text-sm font-medium text-cloudera-gray md:h-96">
      Loading map…
    </div>
  ),
});

type Props = {
  properties: MapPropertyMarker[];
  teams: MapTeamMarker[];
  className?: string;
  heightClassName?: string;
};

export function RunMapLazy(props: Props) {
  return <RunMap {...props} />;
}
