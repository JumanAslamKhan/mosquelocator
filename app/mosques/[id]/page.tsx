import Link from "next/link";
import { notFound } from "next/navigation";

import { getMosqueById, listMosques } from "@/lib/mosque-store";

type MosqueDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MosqueDetailPage({ params }: MosqueDetailPageProps) {
  const { id } = await params;
  const mosque = await getMosqueById(id);

  if (!mosque) {
    notFound();
  }

  const nearbyMosques = (await listMosques({ lat: mosque.lat, lng: mosque.lng })).filter((item) => item.id !== mosque.id).slice(0, 3);
  const prayerTimes = mosque.timings;

  return (
    <main className="min-h-screen bg-[#07140f] px-6 py-10 text-white sm:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-[#0d1f18]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Mosque detail</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">{mosque.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{mosque.address}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-emerald-100 transition hover:bg-white/10">Home</Link>
              <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-emerald-100 transition hover:bg-white/10">Dashboard</Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              ["Distance", mosque.distanceLabel ?? "Location loaded"],
              ["Phone", mosque.phone ?? "Not listed"],
              ["Latitude", mosque.lat.toFixed(5)],
              ["Longitude", mosque.lng.toFixed(5)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</div>
                <div className="mt-2 text-sm font-medium text-white">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/70">Prayer times</p>
            <h2 className="mt-2 text-2xl font-semibold">Today&apos;s schedule</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {prayerTimes ? (
                Object.entries(prayerTimes).map(([label, value]) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-[#0d1f18] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</div>
                    <div className="mt-1 text-lg font-medium text-white">{value}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 rounded-3xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
                  Prayer times not available for this mosque
                </div>
              )}
            </div>

            <div className="mt-8">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/70">Facilities</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(mosque.facilities ?? []).map((facility) => (
                  <span key={facility} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0d1f18]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/70">Photos</p>
            <h2 className="mt-2 text-2xl font-semibold">Gallery preview</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(mosque.photos?.length ? mosque.photos : [
                "Main prayer hall",
                "Ablution area",
                "Entrance view",
                "Women prayer space",
              ]).map((photo, index) => (
                <div
                  key={`${photo}-${index}`}
                  className="flex min-h-36 items-end rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.28),rgba(8,23,16,0.92))] p-4"
                >
                  <div className="text-sm font-medium text-white">{photo}</div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/70">Nearby mosques</p>
              <div className="mt-4 space-y-3">
                {nearbyMosques.map((nearby) => (
                  <Link key={nearby.id} href={`/mosques/${nearby.id}`} className="block rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-300/30 hover:bg-white/10">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-white">{nearby.name}</div>
                        <div className="mt-1 text-sm text-slate-300">{nearby.address}</div>
                      </div>
                      <div className="text-sm text-emerald-100">{nearby.distanceLabel ?? "nearby"}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}