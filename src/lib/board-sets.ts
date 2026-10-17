export const BOARD_SET_IDS = ["LONDON_FULL", "CITY_OF_LONDON", "SAFFRON_WALDEN"] as const;

export type BoardSetId = (typeof BOARD_SET_IDS)[number];

export const BOARD_SET_CONFIG: Record<
  BoardSetId,
  {
    label: string;
    subtitle: string;
    startingBalance: number;
    geofenceRadiusM: number;
    suggestedDuration: string;
    stopCount: number;
  }
> = {
  LONDON_FULL: {
    label: "Full London",
    subtitle: "Classic 22-stop board across the city",
    startingBalance: 1500,
    geofenceRadiusM: 120,
    suggestedDuration: "Full day",
    stopCount: 22,
  },
  CITY_OF_LONDON: {
    label: "City of London",
    subtitle: "Compact 14-stop board around Liverpool Street",
    startingBalance: 1200,
    geofenceRadiusM: 100,
    suggestedDuration: "2–3 hours",
    stopCount: 14,
  },
  SAFFRON_WALDEN: {
    label: "Saffron Walden",
    subtitle: "14-stop Essex market town trail from Market Square",
    startingBalance: 1200,
    geofenceRadiusM: 100,
    suggestedDuration: "2–3 hours",
    stopCount: 14,
  },
};

export function normalizeBoardSet(id: unknown): BoardSetId {
  if (typeof id === "string" && id in BOARD_SET_CONFIG) {
    return id as BoardSetId;
  }
  return "LONDON_FULL";
}

export function getBoardSetConfig(id: unknown) {
  return BOARD_SET_CONFIG[normalizeBoardSet(id)];
}

export function boardSetLabel(id: BoardSetId | string | undefined | null): string {
  return getBoardSetConfig(id).label;
}
