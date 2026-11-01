import type { Location, PropertyOwnership } from "@/generated/prisma/client";

/** Rent multiplier when a hotel is built on a property (full colour set required). */
export const HOTEL_RENT_MULTIPLIER = 2;

export function hotelCost(location: Pick<Location, "price">): number {
  return location.price;
}

export function effectiveRent(
  location: Pick<Location, "rent">,
  ownership: Pick<PropertyOwnership, "hasHotel"> | null | undefined,
): number {
  if (ownership?.hasHotel) {
    return location.rent * HOTEL_RENT_MULTIPLIER;
  }
  return location.rent;
}

export function teamOwnsFullColorSet(params: {
  teamId: string;
  colorGroup: string;
  locations: Location[];
  ownerships: PropertyOwnership[];
}): boolean {
  const inGroup = params.locations.filter((l) => l.colorGroup === params.colorGroup);
  if (inGroup.length === 0) return false;
  const ownedIds = new Set(
    params.ownerships.filter((o) => o.teamId === params.teamId).map((o) => o.locationId),
  );
  return inGroup.every((l) => ownedIds.has(l.id));
}
