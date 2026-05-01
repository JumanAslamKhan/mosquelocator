"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      setMessage("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable login.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const signUp = await supabase.auth.signUp({ email, password });
      if (signUp.error) {
        setMessage(signUp.error.message);
      } else {
        setMessage("Account created. You can now open the dashboard.");
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#07140f] px-6 py-10 text-white sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Mosque Locator</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Sign in to manage mosque listings</h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Use Supabase Auth to manage mosque owner accounts. Once signed in, you can add mosques, edit details,
              and control prayer time offsets.
            </p>

            <div className="mt-8 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">Basic auth uses Supabase email and password.</div>
              <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">Signed-in owners can open the dashboard immediately.</div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#0d1f18]/95 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/70">Login</p>
              <h2 className="mt-3 text-2xl font-semibold">Welcome back</h2>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@mosquelocator.com"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#081710] px-4 text-white outline-none focus:border-emerald-300/50"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#081710] px-4 text-white outline-none focus:border-emerald-300/50"
                />
              </label>
              <button disabled={loading} className="h-12 w-full rounded-2xl bg-emerald-400 font-medium text-[#07140f] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-200">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {message ? <p className="mt-4 text-sm text-amber-200">{message}</p> : null}

            <p className="mt-6 text-sm text-slate-300">
              Back to <Link href="/" className="text-emerald-200 underline underline-offset-4">home</Link> or open the <Link href="/dashboard" className="text-emerald-200 underline underline-offset-4">dashboard</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}