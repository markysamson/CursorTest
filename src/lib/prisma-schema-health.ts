import { BoardSet as PrismaBoardSetEnum } from "@/generated/prisma/enums";
import { BOARD_SET_IDS } from "@/lib/board-sets";

export const PRISMA_REFRESH_HINT =
  "Stop the dev server, then from the app folder run: npm run db:generate && npm run db:seed && npm run dev (do not use bare npx prisma — it may install Prisma 8)";

/** App board list vs Prisma enum (e.g. after schema change without restarting dev). */
export function boardSetPrismaOutOfSyncMessage(): string | null {
  const prismaValues = new Set<string>(Object.values(PrismaBoardSetEnum));
  const missing = BOARD_SET_IDS.filter((id) => !prismaValues.has(id));
  if (missing.length === 0) {
    return null;
  }
  return `This server’s Prisma client is missing board set(s): ${missing.join(", ")}. ${PRISMA_REFRESH_HINT}`;
}

export function prismaSchemaHelpMessage(error: unknown): string | null {
  const sync = boardSetPrismaOutOfSyncMessage();
  if (sync) {
    return sync;
  }

  const text = error instanceof Error ? error.message : String(error);
  if (
    text.includes("Expected BoardSet") ||
    text.includes("Invalid value for argument `boardSet`")
  ) {
    return `That board is not available until Prisma is regenerated. ${PRISMA_REFRESH_HINT}`;
  }
  if (text.includes("boardSet") || text.includes("Unknown argument")) {
    return `Database or Prisma client is out of date. ${PRISMA_REFRESH_HINT}`;
  }
  return null;
}
