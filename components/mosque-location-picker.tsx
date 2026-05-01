"use client";

import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";

type MosqueLocationPickerProps = {
  lat: number;
  lng: number;
  onChange: (nextLocation: { lat: number; lng: number }) => void;
};

function ClickHandler({ onChange }: { onChange: MosqueLocationPickerProps["onChange"] }) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

export default function MosqueLocationPicker({ lat, lng, onChange }: MosqueLocationPickerProps) {
  const center = { lat, lng };
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#081710]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-slate-300">
        <span>Click on the map to place the mosque pin exactly.</span>
        <span className="font-medium text-emerald-200">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </span>
      </div>
      {mounted ? (
        <MapContainer center={center} zoom={16} className="h-[320px] w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          <CircleMarker center={center} radius={10} pathOptions={{ color: "#fbbf24", fillColor: "#fbbf24", fillOpacity: 0.45 }} />
        </MapContainer>
      ) : (
        <div className="flex h-[320px] items-center justify-center text-sm text-slate-400">Loading map...</div>
      )}
    </div>
  );
}