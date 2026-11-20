import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  activity: z.string().trim().min(8).max(180),
  reward: z.number().int().min(1).max(2000),
  minutes: z.number().int().min(1).max(180),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter an activity, a reward from £1 to £2000, and a time limit from 1 to 180 minutes." },
      { status: 400 },
    );
  }

  const game = await prisma.game.findFirst({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { teams: true } } },
  });
  if (!game) {
    return NextResponse.json({ error: "No game to send a Chance card to." }, { status: 404 });
  }
  if (game.status === "FINISHED") {
    return NextResponse.json(
      { error: "This run has ended. Start a new game before sending a Chance card." },
      { status: 409 },
    );
  }
  if (game._count.teams === 0) {
    return NextResponse.json(
      { error: "Add at least one team before sending a Chance card." },
      { status: 400 },
    );
  }

  const { activity, reward, minutes } = parsed.data;
  const deadlineAt = new Date(Date.now() + minutes * 60_000);
  const card = await prisma.chanceCard.create({
    data: { gameId: game.id, activity, reward, deadlineAt },
  });

  return NextResponse.json(
    {
      card: {
        id: card.id,
        activity: card.activity,
        reward: card.reward,
        deadlineAt: card.deadlineAt.toISOString(),
        teamCount: game._count.teams,
      },
    },
    { status: 201 },
  );
}
