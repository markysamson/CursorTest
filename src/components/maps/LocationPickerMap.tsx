"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { CircleMarker, MapContainer, Marker, Tooltip, TileLayer, useMap, useMapEvents } from "react-leaflet";

export type PickerNeighbour = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type Props = {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
  neighbours?: PickerNeighbour[];
  heightClassName?: string;
};

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#dc2626;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.45);transform:rotate(-45deg);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function ClickToPlace({ onChange }: { onChange: Props["onChange"] }) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

/** Keep the pin visible when its position is changed from outside the map. */
function FollowPin({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map.getBounds().pad(-0.1).contains([latitude, longitude])) {
      map.setView([latitude, longitude], Math.max(map.getZoom(), 17));
    }
  }, [map, latitude, longitude]);
  return null;
}

export function LocationPickerMap({
  latitude,
  longitude,
  onChange,
  neighbours = [],
  heightClassName = "h-72",
}: Props) {
  const markerRef = useRef<L.Marker>(null);

  const dragHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const pos = marker.getLatLng();
          onChange(pos.lat, pos.lng);
        }
      },
    }),
    [onChange],
  );

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={17}
      scrollWheelZoom
      className={`z-0 w-full rounded-xl border border-cloudera-border ${heightClassName}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPlace onChange={onChange} />
      <FollowPin latitude={latitude} longitude={longitude} />
      {neighbours.map((n) => (
        <CircleMarker
          key={n.id}
          center={[n.latitude, n.longitude]}
          radius={6}
          pathOptions={{ color: "#1e4976", fillColor: "#1e4976", fillOpacity: 0.35, weight: 1 }}
        >
          <Tooltip direction="top">{n.name}</Tooltip>
        </CircleMarker>
      ))}
      <Marker
        draggable
        ref={markerRef}
        position={[latitude, longitude]}
        icon={pinIcon}
        eventHandlers={dragHandlers}
      />
    </MapContainer>
  );
}
