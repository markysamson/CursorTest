export type MapPropertyMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  colorGroup: string;
  /** Manager map: rival team name. Team map: omit or use possession only. */
  ownerName?: string | null;
  price?: number;
  rent?: number;
  /** Team view — never reveals other owners */
  possession?: "owned" | "unowned";
};

export type MapTeamMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  leaderName?: string;
  isSelf?: boolean;
  updatedAt?: string | null;
};

export const TEAM_MARKER_COLORS = [
  "#C2410C",
  "#1E4976",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
  "#eab308",
  "#ec4899",
  "#6366f1",
] as const;
