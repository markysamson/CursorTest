import { getAdminSession, hashPin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2).max(40),
  leaderName: z.string().min(2).max(60),
  pin: z.string().min(4).max(12).regex(/^\d+$/, "PIN must be digits only"),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const game = await prisma.game.findFirst({ orderBy: { createdAt: "desc" } });
  if (!game) {
    return NextResponse.json({ error: "Create a new game from the manager console first." }, { status: 404 });
  }
  if (game.status === "FINISHED") {
    return NextResponse.json(
      { error: "This run has ended. Create a new game before adding teams." },
      { status: 409 },
    );
  }

  const pinHash = await hashPin(parsed.data.pin);
  try {
    const team = await prisma.team.create({
      data: {
        gameId: game.id,
        name: parsed.data.name.trim(),
        leaderName: parsed.data.leaderName.trim(),
        pinHash,
        balance: game.startingBalance,
      },
    });
    return NextResponse.json({ team: { id: team.id, name: team.name, leaderName: team.leaderName, balance: team.balance } });
  } catch {
    return NextResponse.json({ error: "A team with that name already exists" }, { status: 409 });
  }
}
