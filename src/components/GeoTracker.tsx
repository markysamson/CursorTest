"use client";

import { useEffect, useState } from "react";

export type GeoPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type Props = {
  onUpdate: (pos: GeoPosition | null, error: string | null) => void;
};

export function GeoTracker({ onUpdate }: Props) {
  const [status, setStatus] = useState<string>("Waiting for GPS…");

  useEffect(() => {
    if (!navigator.geolocation) {
      const msg = "Geolocation is not supported on this device.";
      window.setTimeout(() => {
        setStatus(msg);
        onUpdate(null, msg);
      }, 0);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const data = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setStatus(`GPS lock · ±${Math.round(pos.coords.accuracy)}m`);
        onUpdate(data, null);
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable GPS for the team leader's browser."
            : "Unable to read GPS position.";
        setStatus(msg);
        onUpdate(null, msg);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onUpdate]);

  return (
    <div className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/50 px-3 py-1.5 text-xs text-emerald-100">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      {status}
    </div>
  );
}
