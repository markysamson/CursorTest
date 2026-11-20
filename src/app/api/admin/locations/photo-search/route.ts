import { getAdminSession } from "@/lib/auth";
import { searchCommonsPhotos } from "@/lib/wikimedia";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ error: "Enter something to search for." }, { status: 400 });
  }

  try {
    const photos = await searchCommonsPhotos(q);
    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json(
      { error: "Wikimedia Commons is not responding right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
