import { getAdminSession } from "@/lib/auth";
import { searchWikidataPlaces } from "@/lib/wikimedia";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ error: "Enter a name to search for." }, { status: 400 });
  }

  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const near =
    searchParams.get("lat") && searchParams.get("lng") && Number.isFinite(lat) && Number.isFinite(lng)
      ? { latitude: lat, longitude: lng }
      : undefined;

  try {
    const suggestions = await searchWikidataPlaces(q, near);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json(
      { error: "Wikidata is not responding right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
