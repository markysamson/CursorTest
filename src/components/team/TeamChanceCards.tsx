"use client";

import type { TeamChanceCard } from "@/lib/chance-types";
import { resizeImageForUpload } from "@/lib/client-image";
import { useEffect, useState } from "react";

const SEEN_KEY = "chance-alerts";

function alertKey(card: TeamChanceCard) {
  return `${card.id}:${card.submission?.status ?? "NEW"}`;
}

function remaining(deadlineAt: string, now: number) {
  const ms = new Date(deadlineAt).getTime() - now;
  if (ms <= 0) return null;
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TeamChanceCards({
  cards,
  gameFinished,
  onSubmitted,
}: {
  cards: TeamChanceCard[];
  gameFinished: boolean;
  onSubmitted: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [seen, setSeen] = useState<string[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    const boot = window.setTimeout(() => {
      try {
        const stored = JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]");
        setSeen(Array.isArray(stored) ? stored.filter((item) => typeof item === "string") : []);
      } catch {
        setSeen([]);
      }
    }, 0);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(boot);
    };
  }, []);

  function dismiss(key: string) {
    setSeen((prev) => {
      const next = [...(prev ?? []), key];
      sessionStorage.setItem(SEEN_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function submit(cardId: string, file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusyId(cardId);
    try {
      const photo = await resizeImageForUpload(file);
      const form = new FormData();
      form.set("chanceCardId", cardId);
      form.set("selfie", photo);
      const res = await fetch("/api/team/chance", { method: "POST", body: form });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Could not send the photo.");
        return;
      }
      onSubmitted();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not send the photo.");
    } finally {
      setBusyId(null);
    }
  }

  if (cards.length === 0) return null;

  // Only the latest card raises a dialog. Older results stay in the list, so a
  // previous rejection cannot pop up over a photo the team just sent.
  const latest = cards[0];
  const popup =
    seen && latest && latest.submission?.status !== "PENDING" && !seen.includes(alertKey(latest))
      ? latest
      : undefined;

  return (
    <>
      <section className="mb-4 space-y-3">
        {cards.map((card) => {
          const left = remaining(card.deadlineAt, now);
          const status = card.submission?.status;
          const canSend = !gameFinished && left != null && status !== "PENDING" && status !== "APPROVED";
          return (
            <article key={card.id} className="rounded-2xl border-2 border-cloudera-orange bg-cloudera-orange-soft p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-cloudera-orange-dark">Chance card</p>
              <h2 className="mt-1 text-lg font-bold text-cloudera-navy">{card.activity}</h2>
              <p className="mt-1 text-sm font-medium text-cloudera-navy">
                £{card.reward} for the team
                {left ? ` · ${left} left` : " · time's up"}
              </p>
              {status === "PENDING" && (
                <p className="mt-2 text-sm font-medium text-cloudera-navy">
                  Photo sent. The manager checks it before you are paid.
                </p>
              )}
              {status === "APPROVED" && (
                <p className="mt-2 text-sm font-semibold text-emerald-800">Approved. £{card.reward} has been added.</p>
              )}
              {status === "REJECTED" && (
                <p className="mt-2 text-sm font-medium text-red-800">
                  That photo was not accepted.
                  {canSend ? " Send another before the timer ends." : ""}
                </p>
              )}
              {canSend && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="btn-primary cursor-pointer rounded-xl px-4 py-2 text-sm">
                    {busyId === card.id ? "Sending…" : "Take selfie"}
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="sr-only"
                      disabled={busyId === card.id}
                      onChange={(e) => {
                        void submit(card.id, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <label className="btn-secondary cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold">
                    Choose photo
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={busyId === card.id}
                      onChange={(e) => {
                        void submit(card.id, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              )}
            </article>
          );
        })}
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
      </section>

      {popup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="alertdialog" aria-modal="true" aria-label="Chance card">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-cloudera-orange-dark">Chance card</p>
            {popup.submission?.status === "APPROVED" ? (
              <>
                <h2 className="mt-1 text-xl font-bold text-cloudera-navy">You got paid</h2>
                <p className="mt-2 text-sm text-cloudera-gray">
                  £{popup.reward} has been added for: {popup.activity}
                </p>
              </>
            ) : popup.submission?.status === "REJECTED" ? (
              <>
                <h2 className="mt-1 text-xl font-bold text-cloudera-navy">Photo not accepted</h2>
                <p className="mt-2 text-sm text-cloudera-gray">
                  The manager did not approve the photo for: {popup.activity}
                  {remaining(popup.deadlineAt, now) && !gameFinished
                    ? " You can send another before the timer ends."
                    : ""}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-1 text-xl font-bold text-cloudera-navy">{popup.activity}</h2>
                <p className="mt-2 text-sm text-cloudera-gray">
                  Do this and send a photo. The manager checks it, then your team is paid £{popup.reward}.
                  {remaining(popup.deadlineAt, now)
                    ? ` Time left: ${remaining(popup.deadlineAt, now)}.`
                    : " The time limit has passed."}
                </p>
              </>
            )}
            <button
              type="button"
              onClick={() => dismiss(alertKey(popup))}
              className="btn-primary mt-4 w-full rounded-xl py-2.5 text-sm"
            >
              {popup.submission ? "OK" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
