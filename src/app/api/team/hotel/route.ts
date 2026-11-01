import { getTeamSession } from "@/lib/auth";
import { GameActionError, processRemoteHotelPurchase } from "@/lib/game-logic";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  locationId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getTeamSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "locationId required" }, { status: 400 });
  }

  try {
    const result = await processRemoteHotelPurchase({
      teamId: session.teamId,
      gameId: session.gameId,
      locationId: parsed.data.locationId,
    });
    return NextResponse.json({ result });
  } catch (e) {
    if (e instanceof GameActionError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Hotel purchase failed" }, { status: 500 });
  }
}
