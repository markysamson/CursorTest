import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["SETUP", "ACTIVE", "FINISHED"]).optional(),
  name: z.string().min(2).max(80).optional(),
  startingBalance: z.number().int().min(100).max(100000).optional(),
  geofenceRadiusM: z.number().int().min(30).max(500).optional(),
});

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

  let game = await prisma.game.findFirst({ orderBy: { createdAt: "desc" } });
  if (!game) {
    game = await prisma.game.create({
      data: { name: "London Monopoly Run", ...parsed.data },
    });
    return NextResponse.json({ game });
  }

  const updated = await prisma.game.update({
    where: { id: game.id },
    data: parsed.data,
  });
  return NextResponse.json({ game: updated });
}
