"use client";

import dynamic from "next/dynamic";
import type { PickerNeighbour } from "./LocationPickerMap";

const LocationPickerMap = dynamic(
  () => import("./LocationPickerMap").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-xl border border-cloudera-border bg-cloudera-muted text-sm font-medium text-cloudera-gray">
        Loading map…
      </div>
    ),
  },
);

type Props = {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
  neighbours?: PickerNeighbour[];
  heightClassName?: string;
};

export function LocationPickerMapLazy(props: Props) {
  return <LocationPickerMap {...props} />;
}
