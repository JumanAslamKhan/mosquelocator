"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import type { Mosque } from "@/lib/types";

type MapViewProps = {
  mosques: Mosque[];
  location: { lat: number; lng: number; accuracy?: number } | null;
  selectedMosqueId: string | null;
  onSelectMosque: (id: string) => void;
};

export default function MapView({ mosques, location, selectedMosqueId, onSelectMosque }: MapViewProps) {
  const center = location ?? (mosques[0] ? { lat: mosques[0].lat, lng: mosques[0].lng } : { lat: 19.0760, lng: 72.8777 });

  return (
    <MapContainer center={center} zoom={location ? 14 : 12} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {location ? (
        <>
          {location.accuracy ? (
            <CircleMarker
              center={location}
              radius={Math.max(10, location.accuracy)}
              pathOptions={{ color: "#60a5fa", fillColor: "#60a5fa", fillOpacity: 0.1 }}
            >
              <Popup>Approximate location range</Popup>
            </CircleMarker>
          ) : null}
          <CircleMarker center={location} radius={10} pathOptions={{ color: "#34d399", fillColor: "#34d399", fillOpacity: 0.35 }}>
            <Popup>Your location</Popup>
          </CircleMarker>
        </>
      ) : null}

      {mosques.map((mosque) => (
        <CircleMarker
          key={mosque.id}
          center={{ lat: mosque.lat, lng: mosque.lng }}
          radius={selectedMosqueId === mosque.id ? 12 : 9}
          pathOptions={{
            color: selectedMosqueId === mosque.id ? "#fbbf24" : "#10b981",
            fillColor: selectedMosqueId === mosque.id ? "#fbbf24" : "#10b981",
            fillOpacity: 0.4,
          }}
          eventHandlers={{ click: () => onSelectMosque(mosque.id) }}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{mosque.name}</p>
              <p>{mosque.address}</p>
              <p>{mosque.distanceLabel ?? "nearby"}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}