import { getTeamSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { distanceMeters } from "@/lib/geo";
import { boardSetLabel } from "@/lib/board-sets";
import {
  effectiveRent,
  hotelCost,
  teamOwnsFullColorSet,
} from "@/lib/monopoly-rules";
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

  const game = await prisma.game.findUnique({ where: { id: session.gameId } });
  if (!game) {
    return NextResponse.json({ error: "Session invalid" }, { status: 401 });
  }

  const [team, locations, ownerships, recentVisits] = await Promise.all([
    prisma.team.findUnique({ where: { id: session.teamId } }),
    prisma.location.findMany({
      where: { boardSet: game.boardSet },
      orderBy: { boardOrder: "asc" },
    }),
    prisma.propertyOwnership.findMany({
      where: { gameId: session.gameId },
    }),
    prisma.visit.findMany({
      where: { gameId: session.gameId, teamId: session.teamId },
      include: { location: true },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  if (!team) {
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
    const ownedByYou = own?.teamId === team.id;
    const ownedByOther = !!own && !ownedByYou;

    let distanceM: number | null = null;
    let inRange = false;
    if (userLat != null && userLng != null && !Number.isNaN(userLat) && !Number.isNaN(userLng)) {
      distanceM = Math.round(distanceMeters(userLat, userLng, loc.latitude, loc.longitude));
      inRange = distanceM <= game.geofenceRadiusM;
    }

    const rentDue = own ? effectiveRent(loc, own) : loc.rent;
    const hasHotel = ownedByYou && !!own?.hasHotel;
    const fullColorSet =
      ownedByYou &&
      teamOwnsFullColorSet({
        teamId: team.id,
        colorGroup: loc.colorGroup,
        locations,
        ownerships,
      });
    const canBuyHotel =
      game.status === "ACTIVE" &&
      inRange &&
      ownedByYou &&
      fullColorSet &&
      !own?.hasHotel;

    let action: "purchase" | "rent" | "own" | "none" = "none";
    if (game.status === "ACTIVE" && inRange) {
      if (!own) action = "purchase";
      else if (ownedByYou) action = "own";
      else action = "rent";
    }

    return {
      id: loc.id,
      name: loc.name,
      colorGroup: loc.colorGroup,
      price: loc.price,
      rent: loc.rent,
      rentDue,
      latitude: loc.latitude,
      longitude: loc.longitude,
      boardOrder: loc.boardOrder,
      /** From this team's perspective only — rivals' ownership is hidden. */
      possession: ownedByYou ? ("owned" as const) : ("unowned" as const),
      ownedByYou,
      hasHotel,
      hotelCost: hotelCost(loc),
      canBuyHotel,
      distanceM,
      inRange,
      action,
      /** For server-side logic only; never show rival names in UI */
      _rivalOccupied: ownedByOther,
    };
  });

  const ownedProperties = locationStates
    .filter((loc) => loc.ownedByYou)
    .map((loc) => {
      const own = ownershipByLocation.get(loc.id)!;
      return {
        id: loc.id,
        name: loc.name,
        colorGroup: loc.colorGroup,
        price: loc.price,
        rent: loc.rent,
        rentDue: effectiveRent(loc, own),
        hasHotel: own.hasHotel,
        selfiePath: own.selfiePath,
        latitude: loc.latitude,
        longitude: loc.longitude,
      };
    });

  const sanitizedLocations = locationStates.map(
    ({ _rivalOccupied: _, ...rest }) => rest,
  );

  return NextResponse.json({
    game: {
      name: game.name,
      status: game.status,
      geofenceRadiusM: game.geofenceRadiusM,
      boardSet: game.boardSet,
      boardSetLabel: boardSetLabel(game.boardSet),
    },
    team: {
      id: team.id,
      name: team.name,
      leaderName: team.leaderName,
      balance: team.balance,
    },
    locations: sanitizedLocations,
    ownedProperties,
    recentVisits,
  });
}
