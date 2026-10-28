import { getTeamSession } from "@/lib/auth";
import { updateTeamLocation } from "@/lib/team-location";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export async function POST(request: Request) {
  const session = await getTeamSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Valid latitude and longitude required" }, { status: 400 });
  }

  await updateTeamLocation(session.teamId, parsed.data.latitude, parsed.data.longitude);
  return NextResponse.json({ ok: true });
}
