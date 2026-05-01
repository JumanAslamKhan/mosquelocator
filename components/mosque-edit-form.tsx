"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import type { Mosque } from "@/lib/types";

const MosqueLocationPicker = dynamic(() => import("@/components/mosque-location-picker"), { ssr: false });

type MosqueEditFormProps = {
  mosque: Mosque;
};

export default function MosqueEditForm({ mosque }: MosqueEditFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const [form, setForm] = useState({
    name: mosque.name || "",
    address: mosque.address || "",
    city: mosque.city || "",
    lat: String(mosque.lat),
    lng: String(mosque.lng),
    phone: mosque.phone || "",
    facilities: (mosque.facilities ?? []).join(", ") || "",
    description: mosque.description || "",
    fajr: mosque.timings?.fajr || "05:45 AM",
    dhuhr: mosque.timings?.dhuhr || "12:35 PM",
    asr: mosque.timings?.asr || "04:10 PM",
    maghrib: mosque.timings?.maghrib || "06:34 PM",
    isha: mosque.timings?.isha || "08:05 PM",
    jumuah: mosque.timings?.jumuah || "01:15 PM",
    jumuah2: mosque.timings?.jumuah2 || "",
    jumuah3: mosque.timings?.jumuah3 || "",
  });

  function setLocation(nextLocation: { lat: number; lng: number }) {
    setForm((current) => ({
      ...current,
      lat: String(nextLocation.lat),
      lng: String(nextLocation.lng),
    }));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => setMessage("Could not read your current location."),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }

  // Check auth session on mount
  useEffect(() => {
    async function check() {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(Boolean(data?.session));
      } catch (e) {
        setIsAuthenticated(false);
      }
    }

    void check();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/mosques/${mosque.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        address: form.address,
        city: form.city,
        lat: Number(form.lat),
        lng: Number(form.lng),
        phone: form.phone || null,
        facilities: form.facilities.split(",").map((item) => item.trim()).filter(Boolean),
        description: form.description || null,
        timings: {
          fajr: form.fajr,
          dhuhr: form.dhuhr,
          asr: form.asr,
          maghrib: form.maghrib,
          isha: form.isha,
          jumuah: form.jumuah || undefined,
          jumuah2: form.jumuah2 || undefined,
          jumuah3: form.jumuah3 || undefined,
        },
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? "Could not save the mosque. Check your API and Supabase settings.");
      setLoading(false);
      return;
    }

    setMessage("Mosque updated successfully.");
    setTimeout(() => {
      router.push(`/mosques/${mosque.id}`);
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-[#07140f] px-6 py-10 text-white sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-[2rem] border border-white/10 bg-[#0d1f18]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Edit mosque</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{mosque.name}</h1>
            </div>
            <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-emerald-100 transition hover:bg-white/10">
              Back to dashboard
            </Link>
          </div>

          <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
            {[
              ["name", "Mosque name", "Masjid Al-Hidayah"],
              ["city", "City / area", "Bandra"],
              ["lat", "Latitude", "19.0596"],
              ["lng", "Longitude", "72.8295"],
              ["phone", "Phone", "+91 22 5645 8923"],
              ["address", "Address", "123 Linking Road, Mumbai"],
            ].map(([field, label, placeholder]) => (
              <label key={field} className={`block ${field === "address" ? "sm:col-span-2" : "sm:col-span-1"}`}>
                <span className="mb-2 block text-sm text-slate-300">{label}</span>
                <input
                  value={form[field as keyof typeof form]}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                  type={field === "lat" || field === "lng" ? "number" : "text"}
                  placeholder={placeholder}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#081710] px-4 text-white outline-none focus:border-emerald-300/50"
                />
              </label>
            ))}

            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="block text-sm text-slate-300">Exact mosque location</span>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-emerald-100 transition hover:bg-white/10"
                >
                  Use my current GPS
                </button>
              </div>
              <MosqueLocationPicker lat={Number(form.lat)} lng={Number(form.lng)} onChange={setLocation} />
            </div>

            <div className="sm:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="mb-4">
                <span className="block text-sm text-slate-300">Prayer times</span>
                <p className="mt-1 text-xs text-slate-400">Edit the daily prayer times and optional Jumuah jamat slots.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["fajr", "Fajr", "05:45 AM"],
                  ["dhuhr", "Dhuhr", "12:35 PM"],
                  ["asr", "Asr", "04:10 PM"],
                  ["maghrib", "Maghrib", "06:34 PM"],
                  ["isha", "Isha", "08:05 PM"],
                  ["jumuah", "Jumuah 1", "01:15 PM"],
                  ["jumuah2", "Jumuah 2 (optional)", "01:45 PM"],
                  ["jumuah3", "Jumuah 3 (optional)", "02:15 PM"],
                ].map(([field, label, placeholder]) => (
                  <label key={field} className="block">
                    <span className="mb-2 block text-sm text-slate-300">{label}</span>
                    <input
                      value={form[field as keyof typeof form]}
                      onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                      type="text"
                      placeholder={placeholder}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-[#081710] px-4 text-white outline-none focus:border-emerald-300/50"
                    />
                  </label>
                ))}
              </div>
            </div>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm text-slate-300">Facilities</span>
              <input
                value={form.facilities}
                onChange={(event) => setForm((current) => ({ ...current, facilities: event.target.value }))}
                type="text"
                placeholder="Parking, Wudu, Women prayer area"
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#081710] px-4 text-white outline-none focus:border-emerald-300/50"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm text-slate-300">Notes</span>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Accessibility notes, contact details, or other mosque info"
                className="w-full rounded-2xl border border-white/10 bg-[#081710] px-4 py-3 text-white outline-none focus:border-emerald-300/50"
              />
            </label>

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
              <button
                disabled={loading || isAuthenticated === false}
                className="h-12 rounded-2xl bg-emerald-400 px-5 font-medium text-[#07140f] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-200"
              >
                {loading ? "Saving..." : "Update mosque"}
              </button>
              {isAuthenticated === false ? (
                <div className="mt-2 text-sm text-amber-200">You must <a href="/login" className="underline">log in</a> to edit a mosque.</div>
              ) : null}
              <Link href="/dashboard" className="h-12 rounded-2xl border border-white/10 bg-white/5 px-5 pt-3 text-center font-medium text-white transition hover:bg-white/10">
                Cancel
              </Link>
            </div>
          </form>

          {message ? <p className="mt-4 text-sm text-amber-200">{message}</p> : null}
        </div>
      </div>
    </main>
  );
}
