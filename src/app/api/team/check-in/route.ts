import { getTeamSession } from "@/lib/auth";
import { GameActionError, processLocationCheckIn } from "@/lib/game-logic";
import { saveSelfie } from "@/lib/upload";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getTeamSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const locationId = String(form.get("locationId") ?? "");
  const latitude = Number(form.get("latitude"));
  const longitude = Number(form.get("longitude"));
  const selfie = form.get("selfie");

  if (!locationId || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json({ error: "locationId and GPS coordinates required" }, { status: 400 });
  }

  try {
    let selfiePath: string | undefined;
    if (selfie instanceof File && selfie.size > 0) {
      selfiePath = await saveSelfie(selfie, session.gameId);
    }

    const result = await processLocationCheckIn({
      teamId: session.teamId,
      gameId: session.gameId,
      locationId,
      latitude,
      longitude,
      selfiePath,
    });

    return NextResponse.json({ result });
  } catch (e) {
    if (e instanceof GameActionError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}
