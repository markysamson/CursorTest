"use client";

import { PropertyColorChip } from "@/components/PropertyColor";
import { useEffect } from "react";

export type CheckInOutcomeData = {
  kind: "PURCHASE" | "RENT" | "PASS" | "HOTEL_PURCHASE";
  propertyName: string;
  colorGroup: string;
  amount: number;
  balanceAfter: number;
  rentNow?: number;
};

const COPY: Record<
  CheckInOutcomeData["kind"],
  { heading: string; sign: string; band: string; verb: (name: string) => string }
> = {
  PURCHASE: {
    heading: "Property bought",
    sign: "−",
    band: "bg-emerald-600",
    verb: (name) => `You bought ${name}`,
  },
  RENT: {
    heading: "Rent paid",
    sign: "−",
    band: "bg-red-600",
    verb: (name) => `You paid rent at ${name}`,
  },
  HOTEL_PURCHASE: {
    heading: "Hotel built",
    sign: "−",
    band: "bg-emerald-600",
    verb: (name) => `You built a hotel at ${name}`,
  },
  PASS: {
    heading: "Passed",
    sign: "",
    band: "bg-slate-600",
    verb: (name) => `You passed on ${name}`,
  },
};

export function CheckInOutcome({
  outcome,
  onClose,
}: {
  outcome: CheckInOutcomeData;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = COPY[outcome.kind];
  const paid = outcome.kind !== "PASS";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={copy.heading}
      onClick={onClose}
    >
      <div
        className="outcome-pop w-full max-w-sm overflow-hidden rounded-3xl bg-white text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${copy.band} px-6 py-4 text-white`}>
          <p className="text-sm font-bold uppercase tracking-widest">{copy.heading}</p>
        </div>
        <div className="px-6 py-6">
          <p className="text-lg font-bold text-cloudera-navy">{copy.verb(outcome.propertyName)}</p>
          <div className="mt-2">
            <PropertyColorChip group={outcome.colorGroup} />
          </div>
          {paid ? (
            <p className="mt-5 text-6xl font-extrabold tracking-tight text-cloudera-navy">
              {copy.sign}£{outcome.amount}
            </p>
          ) : (
            <p className="mt-5 text-xl font-bold text-cloudera-navy">Nothing was charged</p>
          )}
          {outcome.kind === "RENT" && (
            <p className="mt-1 text-sm font-medium text-cloudera-gray">Paid to the team that owns it</p>
          )}
          {outcome.kind === "HOTEL_PURCHASE" && outcome.rentNow != null && (
            <p className="mt-1 text-sm font-medium text-cloudera-gray">
              Rivals now pay £{outcome.rentNow} rent here
            </p>
          )}
          {outcome.kind === "PASS" && (
            <p className="mt-1 text-sm font-medium text-cloudera-gray">
              Your visit is logged. You can come back to buy it later.
            </p>
          )}
          <p className="mt-5 text-sm font-semibold text-cloudera-gray">
            Balance <span className="text-cloudera-orange-dark">£{outcome.balanceAfter}</span>
          </p>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="btn-primary mt-5 w-full rounded-xl py-3 text-base"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
