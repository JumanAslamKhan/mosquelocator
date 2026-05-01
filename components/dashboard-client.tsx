"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import type { Mosque } from "@/lib/types";

type DashboardClientProps = {
  initialMosques: Mosque[];
};

export default function DashboardClient({ initialMosques }: DashboardClientProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      router.push("/login");
      return;
    }

    (async () => {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) {
        router.push("/login");
      }
    })();
  }, [router]);

  const mosques = initialMosques;

  return (
    <main className="min-h-screen bg-[#07140f] px-6 py-10 text-white sm:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Manage mosque listings</h1>
            <p className="mt-2 text-sm text-slate-300">Sign in to connect your owner account and manage listings from the dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-emerald-100 transition hover:bg-white/10">Home</Link>
            <Link href="/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-emerald-100 transition hover:bg-white/10">Login</Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            [String(mosques.length), "Mosques listed"],
            ["7", "Awaiting review"],
            ["98%", "Profile completeness"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="text-3xl font-semibold">{value}</div>
              <div className="mt-2 text-sm text-slate-300">{label}</div>
            </div>
          ))}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#0d1f18]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/70">Mosque records</p>
              <h2 className="mt-2 text-2xl font-semibold">Recent updates</h2>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-100">Live</span>
          </div>

          <div className="mt-6 space-y-3">
            {mosques.map((mosque) => (
              <article key={mosque.name} className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:grid-cols-[1.2fr_0.8fr_0.5fr_0.5fr] sm:items-center">
                <div>
                  <h3 className="font-semibold text-white">{mosque.name}</h3>
                  <p className="mt-1 text-sm text-slate-300">{mosque.city ?? mosque.address}</p>
                </div>
                <div className="text-sm text-slate-300">{mosque.created_at}</div>
                <div>
                  <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-medium text-emerald-100">{mosque.distanceLabel ?? "Managed"}</span>
                </div>
                <Link href={`/mosques/${mosque.id}/edit`} className="text-sm text-emerald-200 underline underline-offset-4">Edit</Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}