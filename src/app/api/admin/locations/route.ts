import { getAdminSession } from "@/lib/auth";
import { BOARD_SET_IDS } from "@/lib/board-sets";
import { prisma } from "@/lib/db";
import { LOCATION_COUNT_INCLUDE, toAdminLocation } from "@/lib/admin-locations";
import { commonsLandmarkImageUrl } from "@/lib/landmark-image-url";
import { COLOR_GROUP_STYLES } from "@/lib/locations-data";
import { rentFromPrice } from "@/lib/property-economics";
import { NextResponse } from "next/server";
import { z } from "zod";

const COLOR_GROUPS = Object.keys(COLOR_GROUP_STYLES) as [string, ...string[]];

const createSchema = z.object({
  boardSet: z.enum(BOARD_SET_IDS),
  name: z.string().trim().min(2).max(80),
  colorGroup: z.enum(COLOR_GROUPS),
  price: z.number().int().min(10).max(5000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  verified: z.boolean().optional(),
  wikidataId: z
    .string()
    .regex(/^Q\d+$/)
    .nullable()
    .optional(),
  commonsFile: z.string().trim().min(3).max(300).optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.location.findMany({
    orderBy: [{ boardSet: "asc" }, { boardOrder: "asc" }],
    include: LOCATION_COUNT_INCLUDE,
  });
  return NextResponse.json({ locations: rows.map(toAdminLocation) });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid property details." }, { status: 400 });
  }
  const input = parsed.data;

  const duplicate = await prisma.location.findUnique({
    where: { boardSet_name: { boardSet: input.boardSet, name: input.name } },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "A property with that name already exists on this board." },
      { status: 409 },
    );
  }

  const last = await prisma.location.aggregate({
    where: { boardSet: input.boardSet },
    _max: { boardOrder: true },
  });

  const created = await prisma.location.create({
    data: {
      boardSet: input.boardSet,
      name: input.name,
      colorGroup: input.colorGroup,
      price: input.price,
      rent: rentFromPrice(input.price),
      latitude: input.latitude,
      longitude: input.longitude,
      boardOrder: (last._max.boardOrder ?? 0) + 1,
      verified: input.verified ?? false,
      wikidataId: input.wikidataId ?? null,
      landmarkImageUrl: input.commonsFile ? commonsLandmarkImageUrl(input.commonsFile) : null,
    },
    include: LOCATION_COUNT_INCLUDE,
  });

  return NextResponse.json({ location: toAdminLocation(created) }, { status: 201 });
}
