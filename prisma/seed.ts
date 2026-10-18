import { createPrismaClient } from "../src/lib/prisma-client";
import {
  CITY_OF_LONDON_LOCATIONS,
  LONDON_LOCATIONS,
  SAFFRON_WALDEN_LOCATIONS,
} from "../src/lib/locations-data";

const prisma = createPrismaClient();

const SETS = [
  { boardSet: "LONDON_FULL" as const, locations: LONDON_LOCATIONS },
  { boardSet: "CITY_OF_LONDON" as const, locations: CITY_OF_LONDON_LOCATIONS },
  { boardSet: "SAFFRON_WALDEN" as const, locations: SAFFRON_WALDEN_LOCATIONS },
];

async function main() {
  for (const { boardSet, locations } of SETS) {
    for (const loc of locations) {
      await prisma.location.upsert({
        where: {
          boardSet_name: { boardSet, name: loc.name },
        },
        create: {
          boardSet,
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
  }

  const existingGame = await prisma.game.findFirst({ orderBy: { createdAt: "desc" } });
  if (!existingGame) {
    await prisma.game.create({
      data: {
        name: "London Monopoly Run",
        boardSet: "LONDON_FULL",
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
