import { prisma } from "@/lib/db";

export async function updateTeamLocation(teamId: string, latitude: number, longitude: number) {
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return;

  await prisma.team.update({
    where: { id: teamId },
    data: {
      lastLatitude: latitude,
      lastLongitude: longitude,
      lastLocationAt: new Date(),
    },
  });
}
