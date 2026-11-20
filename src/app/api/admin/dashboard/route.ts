import { getAdminSession } from "@/lib/auth";
import { normalizeBoardSet } from "@/lib/board-sets";
import { prisma } from "@/lib/db";
import { prismaSchemaHelpMessage } from "@/lib/prisma-schema-health";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const game = await prisma.game.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        teams: { orderBy: { name: "asc" } },
        ownerships: {
          include: { location: true, team: true },
          orderBy: { purchasedAt: "desc" },
        },
        visits: {
          include: { team: true, location: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    const boardSet = game ? normalizeBoardSet(game.boardSet) : "LONDON_FULL";

    const locations = game
      ? await prisma.location.findMany({
          where: { boardSet },
          orderBy: { boardOrder: "asc" },
        })
      : [];

    const stopCountRows = await prisma.location.groupBy({
      by: ["boardSet"],
      _count: { _all: true },
    });
    const boardStopCounts = Object.fromEntries(
      stopCountRows.map((row) => [row.boardSet, row._count._all]),
    );

    const ownershipByLocationId = new Map(
      game?.ownerships.map((o) => [o.locationId, o.team.name]) ?? [],
    );

    const mapProperties = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      colorGroup: loc.colorGroup,
      ownerName: ownershipByLocationId.get(loc.id) ?? null,
      price: loc.price,
    }));

    const LOCATION_STALE_MS = 30 * 60 * 1000;
    const now = Date.now();

    const mapTeams =
      game?.teams
        .filter((t) => t.lastLatitude != null && t.lastLongitude != null)
        .map((t) => ({
          id: t.id,
          name: t.name,
          leaderName: t.leaderName,
          latitude: t.lastLatitude as number,
          longitude: t.lastLongitude as number,
          updatedAt: t.lastLocationAt?.toISOString() ?? null,
          stale:
            !t.lastLocationAt || now - t.lastLocationAt.getTime() > LOCATION_STALE_MS,
        })) ?? [];

    const teamsWithoutLocation =
      game?.teams
        .filter((t) => t.lastLatitude == null || t.lastLongitude == null)
        .map((t) => ({ id: t.id, name: t.name, leaderName: t.leaderName })) ?? [];

    const leaderboard =
      game?.teams
        .map((t) => ({
          id: t.id,
          name: t.name,
          leaderName: t.leaderName,
          balance: t.balance,
          propertiesOwned: game.ownerships.filter((o) => o.teamId === t.id).length,
        }))
        .sort((a, b) => b.balance - a.balance) ?? [];

    const chanceRows = game
      ? await prisma.chanceCard.findMany({
          where: { gameId: game.id },
          orderBy: { createdAt: "desc" },
          include: {
            submissions: {
              include: { team: { select: { id: true, name: true } } },
              orderBy: { submittedAt: "asc" },
            },
          },
        })
      : [];
    const chanceHorizon = now - 6 * 60 * 60 * 1000;
    const chanceCards = chanceRows
      .filter(
        (card) =>
          card.deadlineAt.getTime() > now ||
          card.createdAt.getTime() > chanceHorizon ||
          card.submissions.some((submission) => submission.status === "PENDING"),
      )
      .map((card) => ({
        id: card.id,
        activity: card.activity,
        reward: card.reward,
        deadlineAt: card.deadlineAt.toISOString(),
        createdAt: card.createdAt.toISOString(),
        submissions: card.submissions.map((submission) => ({
          id: submission.id,
          teamId: submission.teamId,
          teamName: submission.team.name,
          selfiePath: submission.selfiePath,
          status: submission.status,
          submittedAt: submission.submittedAt.toISOString(),
        })),
      }));

    const gamePayload = game
      ? {
          id: game.id,
          name: game.name,
          boardSet,
          status: game.status,
          startingBalance: game.startingBalance,
          geofenceRadiusM: game.geofenceRadiusM,
          createdAt: game.createdAt,
          updatedAt: game.updatedAt,
          teams: game.teams,
          ownerships: game.ownerships,
          visits: game.visits,
        }
      : null;

    return NextResponse.json({
      game: gamePayload,
      locations,
      leaderboard,
      mapProperties,
      mapTeams,
      teamsWithoutLocation,
      boardStopCounts,
      chanceCards,
    });
  } catch (error) {
    console.error("[admin/dashboard]", error);
    const hint = prismaSchemaHelpMessage(error);
    const detail = error instanceof Error ? error.message : String(error);
    const safeDetail =
      detail.length > 240 ? `${detail.slice(0, 240)}…` : detail;
    return NextResponse.json(
      {
        error:
          hint ??
          `Failed to load dashboard: ${safeDetail}. On the server: sudo journalctl -u monopoly-run -n 30 --no-pager`,
      },
      { status: hint ? 503 : 500 },
    );
  }
}
