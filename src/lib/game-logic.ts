import { prisma } from "@/lib/db";
import { maybeFinishWhenBoardFull } from "@/lib/finish-game";
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

export async function processLocationCheckIn(params: {
  teamId: string;
  gameId: string;
  locationId: string;
  latitude: number;
  longitude: number;
  selfiePath?: string;
  buyHotel?: boolean;
}) {
  const { teamId, gameId, locationId, latitude, longitude, selfiePath, buyHotel } = params;

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

  if (
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

  if (ownership?.teamId === teamId && buyHotel) {
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
      location,
      team: result.updatedTeam,
      amount: cost,
      rentNow: effectiveRent(location, { hasHotel: true }),
    };
  }

  if (!ownership) {
    if (!selfiePath) {
      throw new GameActionError("Upload a team selfie to purchase this property.");
    }
    if (team.balance < location.price) {
      throw new GameActionError(
        `Insufficient funds. ${location.name} costs £${location.price} but you have £${team.balance}.`,
      );
    }

    const purchaseResult = await prisma.$transaction(async (tx) => {
      const updatedTeam = await tx.team.update({
        where: { id: teamId },
        data: { balance: { decrement: location.price } },
      });
      const own = await tx.propertyOwnership.create({
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
      return { updatedTeam, own };
    });

    await maybeFinishWhenBoardFull(gameId);

    return {
      type: "PURCHASE" as const,
      location,
      team: purchaseResult.updatedTeam,
      ownership: purchaseResult.own,
      amount: location.price,
    };
  }

  if (ownership.teamId === teamId) {
    await prisma.visit.create({
      data: {
        gameId,
        teamId,
        locationId,
        visitType: "OWN_VISIT",
        amount: 0,
        verifiedLat: latitude,
        verifiedLng: longitude,
      },
    });
    return {
      type: "OWN_VISIT" as const,
      location,
      team,
      amount: 0,
    };
  }

  const rent = effectiveRent(location, ownership);
  if (team.balance < rent) {
    throw new GameActionError(
      `Insufficient funds for rent. ${location.name} rent is £${rent} but you have £${team.balance}.`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const payer = await tx.team.update({
      where: { id: teamId },
      data: { balance: { decrement: rent } },
    });
    const owner = await tx.team.update({
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
        verifiedLat: latitude,
        verifiedLng: longitude,
      },
    });
    return {
      type: "RENT" as const,
      location,
      team: payer,
      amount: rent,
      ownerBalance: owner.balance,
    };
  });
}
