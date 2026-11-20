"use client";

import type { AdminChanceCard } from "@/lib/chance-types";
import { pickChanceSuggestions } from "@/lib/chance-suggestions";
import { FormEvent, useEffect, useMemo, useState } from "react";

type TeamRef = { id: string; name: string };

const inputClass = "w-full rounded-xl border border-cloudera-border px-3 py-2 text-sm";

function remainingLabel(deadlineAt: string, now: number) {
  const ms = new Date(deadlineAt).getTime() - now;
  if (ms <= 0) return "Time's up";
  const minutes = Math.ceil(ms / 60_000);
  return minutes === 1 ? "1 minute left" : `${minutes} minutes left`;
}

export function ChanceCardButton({
  gameStatus,
  teamCount,
  pendingCount,
  onSent,
}: {
  gameStatus: "SETUP" | "ACTIVE" | "FINISHED";
  teamCount: number;
  pendingCount: number;
  onSent: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(() => pickChanceSuggestions(4));
  const [activity, setActivity] = useState("");
  const [reward, setReward] = useState("50");
  const [minutes, setMinutes] = useState("15");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const closed = gameStatus === "FINISHED";

  async function send(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(null);
    const rewardValue = Number(reward);
    const minutesValue = Number(minutes);
    setBusy(true);
    const res = await fetch("/api/admin/chance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity: activity.trim(),
        reward: rewardValue,
        minutes: minutesValue,
      }),
    });
    setBusy(false);
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      card?: { teamCount: number };
    };
    if (!res.ok) {
      setError(body.error ?? "Could not send the Chance card.");
      return;
    }
    setSent(`Sent to ${body.card?.teamCount ?? teamCount} teams.`);
    setActivity("");
    onSent();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
          setSent(null);
        }}
        className="btn-primary relative rounded-xl px-4 py-2 text-sm"
      >
        Chance card
        {pendingCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
            {pendingCount}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Send a Chance card">
          <form onSubmit={send} className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-cloudera-navy">Chance card</h2>
                <p className="mt-1 text-sm text-cloudera-gray">
                  Every team is alerted. They are paid only after you approve the photo they send back.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-cloudera-border px-3 py-1.5 text-xs font-semibold text-cloudera-navy">
                Close
              </button>
            </div>

            <p className="mt-4 text-sm font-semibold text-cloudera-navy">Suggested activities</p>
            <ul className="mt-2 space-y-2">
              {suggestions.map((idea) => {
                const selected = activity === idea;
                return (
                  <li key={idea}>
                    <button
                      type="button"
                      onClick={() => setActivity(idea)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                        selected
                          ? "border-cloudera-orange bg-cloudera-orange-soft font-semibold text-cloudera-navy"
                          : "border-cloudera-border bg-white text-cloudera-navy hover:border-cloudera-blue"
                      }`}
                    >
                      {idea}
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => setSuggestions(pickChanceSuggestions(4))}
              className="mt-2 text-xs font-semibold text-cloudera-orange-dark underline"
            >
              Different ideas
            </button>

            <label className="mt-4 block text-sm font-semibold text-cloudera-navy">
              Activity
              <textarea
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                rows={3}
                maxLength={180}
                placeholder="Or write your own"
                className={`${inputClass} mt-1 font-normal`}
              />
            </label>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-cloudera-navy">
                Reward (£)
                <input
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  inputMode="numeric"
                  className={`${inputClass} mt-1 font-normal`}
                />
              </label>
              <label className="block text-sm font-semibold text-cloudera-navy">
                Time limit (minutes)
                <input
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  inputMode="numeric"
                  className={`${inputClass} mt-1 font-normal`}
                />
              </label>
            </div>

            {closed && (
              <p className="mt-3 text-sm font-medium text-red-700">This run has ended, so a new card cannot be sent.</p>
            )}
            {teamCount === 0 && !closed && (
              <p className="mt-3 text-sm font-medium text-red-700">Add a team before sending a Chance card.</p>
            )}
            {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
            {sent && <p className="mt-3 text-sm font-medium text-emerald-700">{sent}</p>}

            <button
              type="submit"
              disabled={busy || closed || teamCount === 0}
              className="btn-primary mt-4 w-full rounded-xl py-2.5 text-sm disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send Chance Card"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export function ChanceCardInbox({
  cards,
  teams,
  onChanged,
}: {
  cards: AdminChanceCard[];
  teams: TeamRef[];
  onChanged: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  const pending = useMemo(
    () =>
      cards.flatMap((card) =>
        card.submissions
          .filter((submission) => submission.status === "PENDING")
          .map((submission) => ({ ...submission, activity: card.activity, reward: card.reward })),
      ),
    [cards],
  );

  if (cards.length === 0) return null;

  async function review(id: string, decision: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/chance/submissions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setBusyId(null);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Could not review that photo.");
      return;
    }
    onChanged();
  }

  return (
    <section className="mb-6 space-y-4">
      {pending.length > 0 && (
        <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-4" role="alert">
          <h2 className="text-lg font-bold text-red-900">
            {pending.length === 1 ? "1 Chance card photo to review" : `${pending.length} Chance card photos to review`}
          </h2>
          <p className="mt-1 text-sm text-red-900">
            Pay the team only if the photo shows they did the activity. Nothing is paid until you approve it.
          </p>
          <ul className="mt-3 space-y-3">
            {pending.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 rounded-xl bg-white p-3 sm:flex-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.selfiePath} alt={`Photo from ${item.teamName}`} className="h-40 w-full rounded-lg object-cover sm:w-40" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-cloudera-navy">{item.teamName}</p>
                  <p className="text-sm text-cloudera-gray">{item.activity}</p>
                  <p className="mt-1 text-sm font-semibold text-cloudera-orange-dark">£{item.reward} if approved</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void review(item.id, "approve")}
                      className="btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-60"
                    >
                      Approve and pay £{item.reward}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void review(item.id, "reject")}
                      className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
        </div>
      )}

      <div className="board-card rounded-2xl p-4">
        <h2 className="text-lg font-bold text-cloudera-navy">Chance cards</h2>
        <ul className="mt-3 space-y-3">
          {cards.map((card) => {
            const open = new Date(card.deadlineAt).getTime() > now;
            return (
              <li key={card.id} className="rounded-xl border border-cloudera-border p-3">
                <p className="font-semibold text-cloudera-navy">{card.activity}</p>
                <p className="text-xs font-medium text-cloudera-gray">
                  £{card.reward} · {remainingLabel(card.deadlineAt, now)}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  {teams.map((team) => {
                    const submission = card.submissions.find((item) => item.teamId === team.id);
                    const label = !submission
                      ? "not yet"
                      : submission.status === "PENDING"
                        ? "awaiting review"
                        : submission.status === "APPROVED"
                          ? "paid"
                          : "rejected";
                    return (
                      <li key={team.id} className="rounded-full bg-cloudera-muted px-2 py-1 text-cloudera-navy">
                        {team.name}: {label}
                        {!submission && !open ? " (missed)" : ""}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
