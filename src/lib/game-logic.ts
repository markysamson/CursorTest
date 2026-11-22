import { prisma } from "@/lib/db";
import {
  effectiveRent,
  hotelCost,
  teamOwnsFullColorSet,
} from "@/lib/monopoly-rules";
import { isWithinGeofence } from "@/lib/geo";

export class GameActionError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code?: string,
  ) {
    super(message);
  }
}

async function assertActiveGame(gameId: string) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new GameActionError("Game not found", 404);
  if (game.status !== "ACTIVE") {
    throw new GameActionError(
      game.status === "FINISHED"
        ? "This run has ended. Check your final balance with your manager."
        : "This run is not active yet. Ask your manager to start the game.",
    );
  }
  return game;
}

/** The only location fields a team needs back; rival ownership is never included. */
function summarise(location: { id: string; name: string; colorGroup: string }) {
  return { id: location.id, name: location.name, colorGroup: location.colorGroup };
}

export async function processLocationCheckIn(params: {
  teamId: string;
  gameId: string;
  locationId: string;
  latitude: number;
  longitude: number;
  /**
   * Stores the team's check-in selfie and returns its URL. Only called once the action is
   * certain, so a selfie sent just to find out what the property is does not pile up on disk.
   * Absent when no selfie was sent.
   */
  persistSelfie?: () => Promise<string>;
  /** Required to buy or decline an unowned property. Ignored for rent. */
  decision?: "buy" | "pass";
  buyHotel?: boolean;
  /** Hotels can be bought remotely; location check-ins still require geofence. */
  skipGeofence?: boolean;
}) {
  const { teamId, gameId, locationId, latitude, longitude, persistSelfie, decision, buyHotel, skipGeofence } =
    params;

  const game = await assertActiveGame(gameId);

  const [team, location, ownership, boardLocations, allOwnerships] = await Promise.all([
    prisma.team.findUnique({ where: { id: teamId } }),
    prisma.location.findUnique({ where: { id: locationId } }),
    prisma.propertyOwnership.findUnique({
      where: { gameId_locationId: { gameId, locationId } },
      include: { team: true },
    }),
    prisma.location.findMany({ where: { boardSet: game.boardSet } }),
    prisma.propertyOwnership.findMany({ where: { gameId } }),
  ]);

  if (!team || team.gameId !== gameId) throw new GameActionError("Team not found", 404);
  if (!location) throw new GameActionError("Location not found", 404);

  if (!buyHotel) {
    const alreadyCheckedIn = await prisma.visit.findFirst({
      where: {
        gameId,
        teamId,
        locationId,
        visitType: { in: ["PURCHASE", "RENT"] },
      },
    });
    if (alreadyCheckedIn) {
      throw new GameActionError("You have already checked in at this property during this run.");
    }
  }

  if (
    !skipGeofence &&
    !isWithinGeofence(
      latitude,
      longitude,
      location.latitude,
      location.longitude,
      game.geofenceRadiusM,
    )
  ) {
    throw new GameActionError(
      `You must be within ${game.geofenceRadiusM}m of ${location.name} to check in. Move closer and try again.`,
    );
  }

  if (buyHotel) {
    if (!ownership || ownership.teamId !== teamId) {
      throw new GameActionError("You can only build a hotel on a property your team owns.");
    }
    if (ownership.hasHotel) {
      throw new GameActionError("This property already has a hotel.");
    }
    const fullSet = teamOwnsFullColorSet({
      teamId,
      colorGroup: location.colorGroup,
      locations: boardLocations,
      ownerships: allOwnerships,
    });
    if (!fullSet) {
      throw new GameActionError(
        "You need every property in this colour group before you can build a hotel.",
      );
    }
    const cost = hotelCost(location);
    if (team.balance < cost) {
      throw new GameActionError(
        `Insufficient funds. A hotel costs £${cost} but you have £${team.balance}.`,
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedTeam = await tx.team.update({
        where: { id: teamId },
        data: { balance: { decrement: cost } },
      });
      const own = await tx.propertyOwnership.update({
        where: { id: ownership.id },
        data: { hasHotel: true },
      });
      await tx.visit.create({
        data: {
          gameId,
          teamId,
          locationId,
          visitType: "HOTEL_PURCHASE",
          amount: cost,
          verifiedLat: latitude,
          verifiedLng: longitude,
        },
      });
      return { updatedTeam, own };
    });

    return {
      type: "HOTEL_PURCHASE" as const,
      location: summarise(location),
      balanceAfter: result.updatedTeam.balance,
      amount: cost,
      rentNow: effectiveRent(location, { hasHotel: true }),
    };
  }

  if (ownership?.teamId === teamId) {
    throw new GameActionError("You already own this property.");
  }

  if (!persistSelfie) {
    throw new GameActionError(
      `Take a team selfie at ${location.name} to check in.`,
      422,
      "SELFIE_REQUIRED",
    );
  }

  if (!ownership) {
    if (!decision) {
      return {
        type: "CHOICE" as const,
        location: summarise(location),
        price: location.price,
        balance: team.balance,
        canAfford: team.balance >= location.price,
      };
    }

    if (decision === "pass") {
      const selfiePath = await persistSelfie();
      await prisma.visit.create({
        data: {
          gameId,
          teamId,
          locationId,
          visitType: "PASS",
          amount: 0,
          selfiePath,
          verifiedLat: latitude,
          verifiedLng: longitude,
        },
      });
      return {
        type: "PASS" as const,
        location: summarise(location),
        amount: 0,
        balanceAfter: team.balance,
      };
    }

    if (team.balance < location.price) {
      throw new GameActionError(
        `Insufficient funds. ${location.name} costs £${location.price} but you have £${team.balance}.`,
      );
    }

    const selfiePath = await persistSelfie();
    const purchaseResult = await prisma.$transaction(async (tx) => {
      const updatedTeam = await tx.team.update({
        where: { id: teamId },
        data: { balance: { decrement: location.price } },
      });
      await tx.propertyOwnership.create({
        data: {
          gameId,
          locationId,
          teamId,
          selfiePath,
          purchaseLat: latitude,
          purchaseLng: longitude,
        },
      });
      await tx.visit.create({
        data: {
          gameId,
          teamId,
          locationId,
          visitType: "PURCHASE",
          amount: location.price,
          selfiePath,
          verifiedLat: latitude,
          verifiedLng: longitude,
        },
      });
      return { updatedTeam };
    });

    return {
      type: "PURCHASE" as const,
      location: summarise(location),
      balanceAfter: purchaseResult.updatedTeam.balance,
      amount: location.price,
    };
  }

  const rent = effectiveRent(location, ownership);
  if (team.balance < rent) {
    throw new GameActionError(
      `Insufficient funds for rent. ${location.name} rent is £${rent} but you have £${team.balance}.`,
    );
  }

  const selfiePath = await persistSelfie();
  return prisma.$transaction(async (tx) => {
    const payer = await tx.team.update({
      where: { id: teamId },
      data: { balance: { decrement: rent } },
    });
    await tx.team.update({
      where: { id: ownership.teamId },
      data: { balance: { increment: rent } },
    });
    await tx.visit.create({
      data: {
        gameId,
        teamId,
        locationId,
        visitType: "RENT",
        amount: rent,
        selfiePath,
        verifiedLat: latitude,
        verifiedLng: longitude,
      },
    });
    return {
      type: "RENT" as const,
      location: summarise(location),
      balanceAfter: payer.balance,
      amount: rent,
    };
  });
}

/** Build a hotel without being at the property (uses the property’s coordinates for the visit log). */
export async function processRemoteHotelPurchase(params: {
  teamId: string;
  gameId: string;
  locationId: string;
}) {
  const location = await prisma.location.findUnique({ where: { id: params.locationId } });
  if (!location) throw new GameActionError("Location not found", 404);

  return processLocationCheckIn({
    teamId: params.teamId,
    gameId: params.gameId,
    locationId: params.locationId,
    latitude: location.latitude,
    longitude: location.longitude,
    buyHotel: true,
    skipGeofence: true,
  });
}
