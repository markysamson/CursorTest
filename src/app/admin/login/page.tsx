"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ClouderaLogo } from "@/components/brand/ClouderaLogo";
import { ProductTitle } from "@/components/brand/ProductTitle";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Login failed (${res.status})`);
        return;
      }
      window.location.assign("/admin");
    } catch {
      setError("Could not reach the server. Is npm run dev running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="link-muted mb-6 inline-block">
        ← Back
      </Link>
      <div className="board-card board-card-accent rounded-3xl p-8">
        <ClouderaLogo href="/" size="sm" />
        <div className="mt-4">
          <ProductTitle title="Manager login" subtitle="Enter the admin password for this run." />
        </div>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-cloudera-charcoal">
            Password
            <input
              type="password"
              className="input-field mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full rounded-xl py-3">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
