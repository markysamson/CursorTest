import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const locations = await prisma.location.findMany({ orderBy: { boardOrder: "asc" } });

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

  return NextResponse.json({ game, locations, leaderboard });
}
