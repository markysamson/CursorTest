import { prisma } from "@/lib/db";
import { commonsLandmarkImageUrl } from "@/lib/landmark-image-url";
import { NextResponse } from "next/server";

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <rect fill="#e8eef4" width="640" height="360"/>
  <text x="320" y="180" text-anchor="middle" fill="#1e4976" font-family="system-ui,sans-serif" font-size="22">Landmark photo</text>
</svg>`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId")?.trim();
  if (!locationId) {
    return new NextResponse(PLACEHOLDER_SVG, {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=300" },
    });
  }

  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: { landmarkImageUrl: true, name: true },
  });

  const remoteUrl = location?.landmarkImageUrl?.trim() || null;

  if (!remoteUrl) {
    return new NextResponse(PLACEHOLDER_SVG, {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=300" },
    });
  }

  try {
    const res = await fetch(remoteUrl, {
      redirect: "follow",
      headers: { "User-Agent": "MonopolyRun/1.0 (landmark reference photo)" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return new NextResponse(PLACEHOLDER_SVG, {
        headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=300" },
      });
    }
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(PLACEHOLDER_SVG, {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=300" },
    });
  }
}

/** Re-export for scripts that need to validate URLs */
export { commonsLandmarkImageUrl };
