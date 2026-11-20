import { createPrismaClient } from "../src/lib/prisma-client";
import {
  WENDENS_AMBO_LOCATIONS,
  CITY_OF_LONDON_LOCATIONS,
  LONDON_LOCATIONS,
  SAFFRON_WALDEN_LOCATIONS,
} from "../src/lib/locations-data";
import { commonsLandmarkImageUrl } from "../src/lib/landmark-image-url";
import { rentFromPrice } from "../src/lib/property-economics";

const prisma = createPrismaClient();

const SETS = [
  { boardSet: "LONDON_FULL" as const, locations: LONDON_LOCATIONS },
  { boardSet: "CITY_OF_LONDON" as const, locations: CITY_OF_LONDON_LOCATIONS },
  { boardSet: "SAFFRON_WALDEN" as const, locations: SAFFRON_WALDEN_LOCATIONS },
  { boardSet: "WENDENS_AMBO" as const, locations: WENDENS_AMBO_LOCATIONS },
];

/**
 * Properties are managed by admins in the app (names, positions, photos, create/delete).
 * The seed only populates a board that has no properties yet, so redeploying never
 * overwrites or resurrects anything an admin has changed.
 */
async function main() {
  for (const { boardSet, locations } of SETS) {
    const existing = await prisma.location.count({ where: { boardSet } });
    if (existing > 0) {
      continue;
    }

    for (const loc of locations) {
      await prisma.location.create({
        data: {
          boardSet,
          name: loc.name,
          colorGroup: loc.colorGroup,
          price: loc.price,
          rent: rentFromPrice(loc.price),
          latitude: loc.latitude,
          longitude: loc.longitude,
          boardOrder: loc.boardOrder,
          landmarkImageUrl: commonsLandmarkImageUrl(loc.commonsFile),
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
        geofenceRadiusM: 80,
        showTeamMap: true,
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
