"use client";

import dynamic from "next/dynamic";
import type { MapPropertyMarker, MapTeamMarker } from "@/lib/map-types";

const RunMap = dynamic(() => import("./RunMap").then((m) => m.RunMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-2xl border border-white/15 bg-black/20 text-sm text-emerald-100/70 md:h-96">
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
