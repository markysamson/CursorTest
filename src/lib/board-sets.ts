export type BoardSetId = "LONDON_FULL" | "CITY_OF_LONDON";

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
};

export function boardSetLabel(id: BoardSetId | string): string {
  if (id in BOARD_SET_CONFIG) {
    return BOARD_SET_CONFIG[id as BoardSetId].label;
  }
  return String(id);
}
