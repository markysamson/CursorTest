import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listSelfies } from "@/lib/selfies";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const game = await prisma.game.findFirst({ orderBy: { createdAt: "desc" } });
  if (!game) {
    return NextResponse.json({ items: [] });
  }

  const teamId = new URL(request.url).searchParams.get("teamId") || undefined;
  const items = await listSelfies(game.id, teamId);
  return NextResponse.json({ items });
}
