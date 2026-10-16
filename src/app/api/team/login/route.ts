import { createTeamSession, verifyPin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  teamName: z.string().min(1),
  pin: z.string().min(4),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Team name and PIN required" }, { status: 400 });
  }

  const game = await prisma.game.findFirst({ orderBy: { createdAt: "desc" } });
  if (!game) {
    return NextResponse.json({ error: "No active run configured" }, { status: 404 });
  }

  const team = await prisma.team.findFirst({
    where: {
      gameId: game.id,
      name: parsed.data.teamName.trim(),
    },
  });

  if (!team) {
    return NextResponse.json({ error: "Unknown team" }, { status: 401 });
  }

  const ok = await verifyPin(parsed.data.pin, team.pinHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  await createTeamSession(team.id, game.id);
  return NextResponse.json({
    team: { id: team.id, name: team.name, leaderName: team.leaderName, balance: team.balance },
    game: { id: game.id, name: game.name, status: game.status },
  });
}
