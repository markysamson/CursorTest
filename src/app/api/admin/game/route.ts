import { getAdminSession } from "@/lib/auth";
import { BOARD_SET_CONFIG, BOARD_SET_IDS, type BoardSetId } from "@/lib/board-sets";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["SETUP", "ACTIVE", "FINISHED"]).optional(),
  name: z.string().min(2).max(80).optional(),
  startingBalance: z.number().int().min(100).max(100000).optional(),
  geofenceRadiusM: z.number().int().min(30).max(500).optional(),
  boardSet: z.enum(BOARD_SET_IDS).optional(),
});

const createSchema = z.object({
  boardSet: z.enum(BOARD_SET_IDS).optional(),
  name: z.string().min(2).max(80).optional(),
});

async function getLatestGame() {
  return prisma.game.findFirst({ orderBy: { createdAt: "desc" } });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const current = await getLatestGame();
  if (current && current.status !== "FINISHED") {
    return NextResponse.json(
      { error: "End the current run before creating a new game." },
      { status: 409 },
    );
  }

  const boardSet = (parsed.data.boardSet ?? "LONDON_FULL") as BoardSetId;
  const cfg = BOARD_SET_CONFIG[boardSet];

  const game = await prisma.game.create({
    data: {
      name: parsed.data.name ?? `${cfg.label} Monopoly Run`,
      boardSet,
      status: "SETUP",
      startingBalance: cfg.startingBalance,
      geofenceRadiusM: cfg.geofenceRadiusM,
    },
  });

  return NextResponse.json({ game });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  let game = await getLatestGame();
  if (!game) {
    const boardSet = (parsed.data.boardSet ?? "LONDON_FULL") as BoardSetId;
    const cfg = BOARD_SET_CONFIG[boardSet];
    game = await prisma.game.create({
      data: {
        name: parsed.data.name ?? cfg.label + " Monopoly Run",
        boardSet,
        startingBalance: parsed.data.startingBalance ?? cfg.startingBalance,
        geofenceRadiusM: parsed.data.geofenceRadiusM ?? cfg.geofenceRadiusM,
        status: parsed.data.status,
      },
    });
    return NextResponse.json({ game });
  }

  const data = { ...parsed.data };

  if (data.boardSet != null && data.boardSet !== game.boardSet) {
    if (game.status !== "SETUP") {
      return NextResponse.json(
        { error: "Board can only be changed while the run is in SETUP." },
        { status: 409 },
      );
    }
    const ownershipCount = await prisma.propertyOwnership.count({ where: { gameId: game.id } });
    if (ownershipCount > 0) {
      return NextResponse.json(
        { error: "Cannot change board after properties have been purchased." },
        { status: 409 },
      );
    }
    const cfg = BOARD_SET_CONFIG[data.boardSet as BoardSetId];
    data.startingBalance = data.startingBalance ?? cfg.startingBalance;
    data.geofenceRadiusM = data.geofenceRadiusM ?? cfg.geofenceRadiusM;
    if (!parsed.data.name) {
      data.name = `${cfg.label} Monopoly Run`;
    }
    await prisma.team.updateMany({
      where: { gameId: game.id },
      data: { balance: cfg.startingBalance },
    });
  }

  const updated = await prisma.game.update({
    where: { id: game.id },
    data,
  });
  return NextResponse.json({ game: updated });
}
