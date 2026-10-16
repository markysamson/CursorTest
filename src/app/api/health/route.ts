import { usesExternalDataDir } from "@/lib/data-paths";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    persistentDataDir: usesExternalDataDir(),
  });
}
