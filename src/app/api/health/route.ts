import { usesExternalDataDir } from "@/lib/data-paths";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.game.count();
    return NextResponse.json({
      ok: true,
      persistentDataDir: usesExternalDataDir(),
      database: "ok",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[health]", error);
    return NextResponse.json(
      {
        ok: false,
        persistentDataDir: usesExternalDataDir(),
        database: "error",
        error: detail,
      },
      { status: 503 },
    );
  }
}
