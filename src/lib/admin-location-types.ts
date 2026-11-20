import type { BoardSetId } from "@/lib/board-sets";

export type AdminLocation = {
  id: string;
  boardSet: BoardSetId;
  name: string;
  colorGroup: string;
  price: number;
  rent: number;
  latitude: number;
  longitude: number;
  boardOrder: number;
  landmarkImageUrl: string | null;
  photoRev: string;
  verified: boolean;
  wikidataId: string | null;
  /** How many ownership / visit records would be removed if this property were deleted. */
  ownershipCount: number;
  visitCount: number;
};

export type PlaceSuggestion = {
  id: string;
  label: string;
  description: string;
  latitude: number;
  longitude: number;
  imageFile: string | null;
  distanceM: number | null;
};

export type CommonsPhotoResult = {
  file: string;
  thumbUrl: string;
  pageUrl: string;
};

export type GeocodeSuggestion = {
  name: string;
  latitude: number;
  longitude: number;
};
