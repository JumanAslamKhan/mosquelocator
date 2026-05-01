"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { MapPin, Search, Sparkles } from "lucide-react";

import { haversineDistanceKm, formatDistance } from "@/lib/haversine";
import type { Mosque, PrayerTimes } from "@/lib/types";

const MosqueMap = dynamic(() => import("@/components/map-view"), { ssr: false });

type LocationState = {
  lat: number;
  lng: number;
  accuracy?: number;
};

type HomeClientProps = {
  initialMosques: Mosque[];
};

export default function HomeClient({ initialMosques }: HomeClientProps) {
  const [query, setQuery] = useState("");
  const [mosques, setMosques] = useState<Mosque[]>(initialMosques);
  const [selectedId, setSelectedId] = useState<string | null>(initialMosques[0]?.id ?? null);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Showing all available mosques");
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const supabase = getBrowserSupabaseClient();
      if (!supabase) return;

      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        setIsLoggedIn(Boolean(session));
        setUserEmail(session?.user?.email ?? null);
      } catch (e) {
        // ignore
      }
    }

    void checkSession();
  }, []);

  const selectedMosque = useMemo(
    () => mosques.find((mosque) => mosque.id === selectedId) ?? mosques[0] ?? null,
    [mosques, selectedId],
  );

    useEffect(() => {
      setPrayerTimes(selectedMosque?.timings ?? null);
    }, [selectedMosque]);

  async function loadMosques(nextLocation?: LocationState | null, searchQuery = "") {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }

      if (nextLocation) {
        params.set("lat", String(nextLocation.lat));
        params.set("lng", String(nextLocation.lng));
      }

      const response = await fetch(`/api/mosques?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch mosques");
      }

      const data = (await response.json()) as { mosques: Mosque[] };
      const list = data.mosques.map((mosque) => {
        if (!nextLocation) {
          return mosque;
        }

        const distanceKm = haversineDistanceKm(nextLocation.lat, nextLocation.lng, mosque.lat, mosque.lng);

        return {
          ...mosque,
          distanceKm,
          distanceLabel: formatDistance(distanceKm),
        };
      });

      setMosques(list);
      setSelectedId((current) => current ?? list[0]?.id ?? null);

      setStatus(nextLocation ? "Using your live location" : "Showing all available mosques");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Something went wrong");
      setStatus("Could not refresh mosque list");
    } finally {
      setLoading(false);
    }
  }

  function handleFindNearMe() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setStatus("Requesting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setLocation(nextLocation);
        void loadMosques(nextLocation, query);
      },
      () => {
        setError("Location permission was blocked.");
        setStatus("Enable location to find nearby mosques");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadMosques(location, query);
  }

  return (
    <main className="min-h-screen bg-[#07140f] text-white">
      <div className="relative isolate mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute right-[-5rem] top-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-1/3 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%),linear-gradient(180deg,rgba(7,20,15,0.98),rgba(7,20,15,1))]" />
        </div>

        <header className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Mosque Locator</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Find nearby mosques and prayer times</h1>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm" suppressHydrationWarning>
            {!isLoggedIn ? (
              <Link href="/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-emerald-100 transition hover:border-emerald-300/40 hover:bg-white/10">Login</Link>
            ) : (
              <button
                onClick={async () => {
                  const supabase = getBrowserSupabaseClient();
                  if (!supabase) return router.push("/login");
                  await supabase.auth.signOut();
                  setIsLoggedIn(false);
                  setUserEmail(null);
                  router.push("/");
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-emerald-100 transition hover:border-emerald-300/40 hover:bg-white/10"
              >
                Logout
              </button>
            )}
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-emerald-100 transition hover:border-emerald-300/40 hover:bg-white/10">Dashboard</Link>
                <Link href="/mosques/new" className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-emerald-100 transition hover:bg-emerald-300/20">Add mosque</Link>
              </>
            ) : null}
          </nav>
        </header>

        <section className="grid flex-1 gap-6 pb-6 pt-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-emerald-100">
                  <Sparkles size={14} /> Free services only
                </span>
                <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1">Leaflet map</span>
                <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1">Supabase ready</span>
                <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1">Aladhan prayer times</span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                    Search, map, and manage mosques in one place.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                    Use your browser location to discover nearby mosques, compare distance and facilities, view daily prayer times,
                    and open a mosque detail page for timings and photos.
                  </p>

                  <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
                    <label className="flex-1">
                      <span className="mb-2 block text-sm text-slate-300">Search by mosque name or location</span>
                      <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-[#081710] px-4 focus-within:border-emerald-300/50">
                        <Search className="mr-3 h-4 w-4 text-slate-400" />
                        <input
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                          placeholder="Masjid, street, district"
                          className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                        />
                      </div>
                    </label>
                    <button className="mt-auto h-12 rounded-2xl bg-emerald-400 px-5 font-medium text-[#07140f] transition hover:bg-emerald-300">
                      Search
                    </button>
                  </form>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={handleFindNearMe} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-[#07140f] transition hover:bg-emerald-100">
                      <MapPin size={16} /> Find mosques near me
                    </button>
                    {isLoggedIn ? (
                      <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                        Owner dashboard
                      </Link>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
                    {[
                      "Open now",
                      "Women prayer area",
                      "Parking",
                      "Wheelchair accessible",
                    ].map((filter) => (
                      <span key={filter} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                        {filter}
                      </span>
                    ))}
                  </div>

                  {location?.accuracy ? (
                    <p className="mt-3 text-xs text-slate-400">
                      Location accuracy is about {Math.round(location.accuracy)} meters. If you are indoors, enable GPS/Wi-Fi for better results.
                    </p>
                  ) : null}

                  <p className="mt-4 text-sm text-slate-400">{status}</p>
                  {error ? <p className="mt-2 text-sm text-amber-200">{error}</p> : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    [String(mosques.length), "mosques loaded"],
                    [location ? "live" : "—", location ? "current location set" : "location pending"],
                    [selectedMosque?.distanceLabel ?? "—", "nearest distance"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                      <div className="text-3xl font-semibold tracking-tight text-white">{value}</div>
                      <div className="mt-2 text-sm text-slate-300">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1f18]/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/70">Map</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">Mosques near you</h3>
                  </div>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-100">
                    {loading ? "Refreshing" : "Ready"}
                  </span>
                </div>
              </div>
              <div className="h-[420px]">
                <MosqueMap mosques={mosques} location={location} selectedMosqueId={selectedId} onSelectMosque={setSelectedId} />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-[#0d1f18]/95 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/70">Prayer times</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Today&apos;s timings</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">Aladhan</span>
              </div>

              <div className="mt-5 grid gap-3">
                {prayerTimes ? (
                  Object.entries(prayerTimes).map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="text-sm text-slate-300">{label}</span>
                      <span className="font-medium text-white">{value}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
                    Tap <span className="text-emerald-100">Find mosques near me</span> to load live prayer times.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/70">Mosque list</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Nearby results</h3>
                </div>
                <Link href={selectedMosque ? `/mosques/${selectedMosque.id}` : "/dashboard"} className="text-sm text-emerald-200 underline underline-offset-4">
                  Open details
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {mosques.map((mosque) => (
                  <button
                    key={mosque.id}
                    onClick={() => setSelectedId(mosque.id)}
                    className={`w-full rounded-3xl border p-4 text-left transition ${selectedId === mosque.id ? "border-emerald-300/40 bg-emerald-300/10" : "border-white/10 bg-white/5 hover:border-emerald-300/30 hover:bg-white/8"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-white">{mosque.name}</div>
                        <div className="mt-1 text-sm text-slate-300">{mosque.address}</div>
                      </div>
                      <div className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-medium text-amber-100">
                        {mosque.distanceLabel ?? "nearby"}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                      {(mosque.facilities ?? []).slice(0, 3).map((facility) => (
                        <span key={facility} className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-5 text-sm text-slate-300 backdrop-blur-xl sm:p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/70">Future ads</p>
              <p className="mt-2 font-medium text-white">Placeholder banner for Hajj and Umrah agents</p>
              <p className="mt-2 leading-6">Reserve this section later for sponsored travel or fundraising placements without changing the layout.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}