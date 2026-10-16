import { getTeamSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { distanceMeters } from "@/lib/geo";
import { updateTeamLocation } from "@/lib/team-location";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getTeamSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const [game, team, locations, ownerships, recentVisits] = await Promise.all([
    prisma.game.findUnique({ where: { id: session.gameId } }),
    prisma.team.findUnique({ where: { id: session.teamId } }),
    prisma.location.findMany({ orderBy: { boardOrder: "asc" } }),
    prisma.propertyOwnership.findMany({
      where: { gameId: session.gameId },
      include: { team: { select: { id: true, name: true } } },
    }),
    prisma.visit.findMany({
      where: { gameId: session.gameId, teamId: session.teamId },
      include: { location: true },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  if (!game || !team) {
    return NextResponse.json({ error: "Session invalid" }, { status: 401 });
  }

  if (lat != null && lng != null) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      await updateTeamLocation(session.teamId, latitude, longitude);
    }
  }

  const ownershipByLocation = new Map(ownerships.map((o) => [o.locationId, o]));

  const userLat = lat ? Number(lat) : null;
  const userLng = lng ? Number(lng) : null;

  const locationStates = locations.map((loc) => {
    const own = ownershipByLocation.get(loc.id);
    let distanceM: number | null = null;
    let inRange = false;
    if (userLat != null && userLng != null && !Number.isNaN(userLat) && !Number.isNaN(userLng)) {
      distanceM = Math.round(distanceMeters(userLat, userLng, loc.latitude, loc.longitude));
      inRange = distanceM <= game.geofenceRadiusM;
    }
    let action: "purchase" | "rent" | "own" | "none" = "none";
    if (game.status === "ACTIVE" && inRange) {
      if (!own) action = "purchase";
      else if (own.teamId === team.id) action = "own";
      else action = "rent";
    }
    return {
      ...loc,
      owner: own ? { id: own.team.id, name: own.team.name, selfiePath: own.selfiePath } : null,
      distanceM,
      inRange,
      action,
    };
  });

  return NextResponse.json({
    game,
    team,
    locations: locationStates,
    recentVisits,
  });
}
