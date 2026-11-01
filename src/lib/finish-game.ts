import { prisma } from "@/lib/db";

/**
 * End the run: charge each team 2× base rent (to the bank) for every board square they never visited.
 */
export async function finishGame(gameId: string) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game || game.status === "FINISHED") {
    return game;
  }

  const [locations, teams] = await Promise.all([
    prisma.location.findMany({
      where: { boardSet: game.boardSet },
      orderBy: { boardOrder: "asc" },
    }),
    prisma.team.findMany({ where: { gameId } }),
  ]);

  await prisma.$transaction(async (tx) => {
    for (const team of teams) {
      for (const location of locations) {
        const visited = await tx.visit.findFirst({
          where: { gameId, teamId: team.id, locationId: location.id },
          select: { id: true },
        });
        if (visited) continue;

        const penalty = location.rent * 2;
        await tx.team.update({
          where: { id: team.id },
          data: { balance: { decrement: penalty } },
        });
        await tx.visit.create({
          data: {
            gameId,
            teamId: team.id,
            locationId: location.id,
            visitType: "END_PENALTY",
            amount: penalty,
            verifiedLat: location.latitude,
            verifiedLng: location.longitude,
          },
        });
      }
    }

    await tx.game.update({
      where: { id: gameId },
      data: { status: "FINISHED" },
    });
  });

  return prisma.game.findUnique({ where: { id: gameId } });
}
