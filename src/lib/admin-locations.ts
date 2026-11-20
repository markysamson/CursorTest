import type { BoardSetId } from "@/lib/board-sets";
import type { AdminLocation } from "@/lib/admin-location-types";
import { photoRevision } from "@/lib/landmark-image-url";

type LocationRow = {
  id: string;
  boardSet: string;
  name: string;
  colorGroup: string;
  price: number;
  rent: number;
  latitude: number;
  longitude: number;
  boardOrder: number;
  landmarkImageUrl: string | null;
  verified: boolean;
  wikidataId: string | null;
  _count: { ownerships: number; visits: number };
};

export function toAdminLocation(row: LocationRow): AdminLocation {
  return {
    id: row.id,
    boardSet: row.boardSet as BoardSetId,
    name: row.name,
    colorGroup: row.colorGroup,
    price: row.price,
    rent: row.rent,
    latitude: row.latitude,
    longitude: row.longitude,
    boardOrder: row.boardOrder,
    landmarkImageUrl: row.landmarkImageUrl,
    photoRev: photoRevision(row.landmarkImageUrl),
    verified: row.verified,
    wikidataId: row.wikidataId,
    ownershipCount: row._count.ownerships,
    visitCount: row._count.visits,
  };
}

export const LOCATION_COUNT_INCLUDE = {
  _count: { select: { ownerships: true, visits: true } },
} as const;
