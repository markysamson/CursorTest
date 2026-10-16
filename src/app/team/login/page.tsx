"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function TeamLoginPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/team/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName, pin }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
      return;
    }
    router.push("/team");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-6 text-sm text-emerald-100/70 hover:text-emerald-50">
        ← Back
      </Link>
      <div className="board-card rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-amber-100">Team login</h1>
        <p className="mt-2 text-sm text-emerald-50/80">
          Team leaders: sign in here and keep location enabled on your phone.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            Team name
            <input
              className="mt-1 w-full rounded-xl border border-amber-200/20 bg-black/20 px-4 py-3"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            PIN
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4,12}"
              className="mt-1 w-full rounded-xl border border-amber-200/20 bg-black/20 px-4 py-3"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-500/90 py-3 font-semibold text-emerald-950 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Start hunting"}
          </button>
        </form>
      </div>
    </main>
  );
}
