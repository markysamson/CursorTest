import "dotenv/config";
import { createPrismaClient } from "../src/lib/prisma-client";
import { LONDON_LOCATIONS } from "../src/lib/locations-data";

const prisma = createPrismaClient();

async function main() {
  for (const loc of LONDON_LOCATIONS) {
    await prisma.location.upsert({
      where: { name: loc.name },
      create: {
        name: loc.name,
        colorGroup: loc.colorGroup,
        price: loc.price,
        rent: loc.rent,
        latitude: loc.latitude,
        longitude: loc.longitude,
        boardOrder: loc.boardOrder,
      },
      update: {
        colorGroup: loc.colorGroup,
        price: loc.price,
        rent: loc.rent,
        latitude: loc.latitude,
        longitude: loc.longitude,
        boardOrder: loc.boardOrder,
      },
    });
  }

  const existingGame = await prisma.game.findFirst({ orderBy: { createdAt: "desc" } });
  if (!existingGame) {
    await prisma.game.create({
      data: {
        name: "London Monopoly Run",
        status: "SETUP",
        startingBalance: 1500,
        geofenceRadiusM: 120,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
