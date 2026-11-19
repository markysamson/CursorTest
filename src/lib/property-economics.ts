/** Base rent as a fraction of purchase price (target band ~50–80%). */
export const RENT_PRICE_RATIO = 0.65;

export function rentFromPrice(price: number): number {
  return Math.max(1, Math.round(price * RENT_PRICE_RATIO));
}

/** Bank penalty multiplier for board squares never visited when the run ends. */
export const MISSED_VISIT_RENT_MULTIPLIER = 1.5;

export function missedVisitPenalty(rent: number): number {
  return Math.max(1, Math.round(rent * MISSED_VISIT_RENT_MULTIPLIER));
}
