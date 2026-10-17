import { prisma } from "@/lib/db";
import { isWithinGeofence } from "@/lib/geo";

export class GameActionError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export async function processLocationCheckIn(params: {
  teamId: string;
  gameId: string;
  locationId: string;
  latitude: number;
  longitude: number;
  selfiePath?: string;
}) {
  const { teamId, gameId, locationId, latitude, longitude, selfiePath } = params;

  const [game, team, location, ownership] = await Promise.all([
    prisma.game.findUnique({ where: { id: gameId } }),
    prisma.team.findUnique({ where: { id: teamId } }),
    prisma.location.findUnique({ where: { id: locationId } }),
    prisma.propertyOwnership.findUnique({
      where: { gameId_locationId: { gameId, locationId } },
      include: { team: true },
    }),
  ]);

  if (!game) throw new GameActionError("Game not found", 404);
  if (!team || team.gameId !== gameId) throw new GameActionError("Team not found", 404);
  if (!location) throw new GameActionError("Location not found", 404);
  if (game.status !== "ACTIVE") {
    throw new GameActionError("This run is not active yet. Ask your manager to start the game.");
  }

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

  if (!ownership) {
    if (!selfiePath) {
      throw new GameActionError("Upload a team selfie to purchase this property.");
    }
    if (team.balance < location.price) {
      throw new GameActionError(
        `Insufficient funds. ${location.name} costs £${location.price} but you have £${team.balance}.`,
      );
    }

    return prisma.$transaction(async (tx) => {
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
      return {
        type: "PURCHASE" as const,
        location,
        team: updatedTeam,
        ownership: own,
        amount: location.price,
        ownerName: team.name,
      };
    });
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
      ownerName: team.name,
    };
  }

  if (team.balance < location.rent) {
    throw new GameActionError(
      `Insufficient funds for rent. ${location.name} rent is £${location.rent} but you have £${team.balance}.`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const payer = await tx.team.update({
      where: { id: teamId },
      data: { balance: { decrement: location.rent } },
    });
    const owner = await tx.team.update({
      where: { id: ownership.teamId },
      data: { balance: { increment: location.rent } },
    });
    await tx.visit.create({
      data: {
        gameId,
        teamId,
        locationId,
        visitType: "RENT",
        amount: location.rent,
        verifiedLat: latitude,
        verifiedLng: longitude,
      },
    });
    return {
      type: "RENT" as const,
      location,
      team: payer,
      amount: location.rent,
      ownerName: ownership.team.name,
      ownerBalance: owner.balance,
    };
  });
}
