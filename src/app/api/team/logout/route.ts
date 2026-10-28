import { clearTeamSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await clearTeamSession();
  return NextResponse.json({ ok: true });
}
