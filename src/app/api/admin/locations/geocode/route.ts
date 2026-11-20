import { getAdminSession } from "@/lib/auth";
import { geocodeAddress } from "@/lib/wikimedia";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) {
    return NextResponse.json({ error: "Enter an address or place name." }, { status: 400 });
  }

  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const near =
    searchParams.get("lat") && searchParams.get("lng") && Number.isFinite(lat) && Number.isFinite(lng)
      ? { latitude: lat, longitude: lng }
      : undefined;

  try {
    const results = await geocodeAddress(q, near);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Address search is not responding right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
