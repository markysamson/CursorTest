import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LOCATION_COUNT_INCLUDE, toAdminLocation } from "@/lib/admin-locations";
import { commonsLandmarkImageUrl } from "@/lib/landmark-image-url";
import { COLOR_GROUP_STYLES } from "@/lib/locations-data";
import { rentFromPrice } from "@/lib/property-economics";
import { removeLandmarkPhotoFile } from "@/lib/upload";
import { NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const COLOR_GROUPS = Object.keys(COLOR_GROUP_STYLES) as [string, ...string[]];

const patchSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    colorGroup: z.enum(COLOR_GROUPS),
    price: z.number().int().min(10).max(5000),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    verified: z.boolean(),
    wikidataId: z.string().regex(/^Q\d+$/).nullable(),
    commonsFile: z.string().trim().min(3).max(300),
    clearPhoto: z.boolean(),
  })
  .partial();

export async function PATCH(request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid property details." }, { status: 400 });
  }
  const input = parsed.data;

  if ((input.latitude === undefined) !== (input.longitude === undefined)) {
    return NextResponse.json(
      { error: "Latitude and longitude must be set together." },
      { status: 400 },
    );
  }

  const existing = await prisma.location.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  if (input.name !== undefined && input.name !== existing.name) {
    const clash = await prisma.location.findUnique({
      where: { boardSet_name: { boardSet: existing.boardSet, name: input.name } },
      select: { id: true },
    });
    if (clash) {
      return NextResponse.json(
        { error: "A property with that name already exists on this board." },
        { status: 409 },
      );
    }
  }

  const data: {
    name?: string;
    colorGroup?: string;
    price?: number;
    rent?: number;
    latitude?: number;
    longitude?: number;
    verified?: boolean;
    wikidataId?: string | null;
    landmarkImageUrl?: string | null;
  } = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.colorGroup !== undefined) data.colorGroup = input.colorGroup;
  if (input.price !== undefined) {
    data.price = input.price;
    data.rent = rentFromPrice(input.price);
  }
  if (input.latitude !== undefined && input.longitude !== undefined) {
    data.latitude = input.latitude;
    data.longitude = input.longitude;
  }
  if (input.verified !== undefined) data.verified = input.verified;
  if (input.wikidataId !== undefined) data.wikidataId = input.wikidataId;
  if (input.commonsFile !== undefined) {
    data.landmarkImageUrl = commonsLandmarkImageUrl(input.commonsFile);
  } else if (input.clearPhoto) {
    data.landmarkImageUrl = null;
  }

  const updated = await prisma.location.update({
    where: { id },
    data,
    include: LOCATION_COUNT_INCLUDE,
  });

  if (data.landmarkImageUrl !== undefined && data.landmarkImageUrl !== existing.landmarkImageUrl) {
    await removeLandmarkPhotoFile(existing.landmarkImageUrl);
  }

  return NextResponse.json({ location: toAdminLocation(updated) });
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.location.findUnique({
    where: { id },
    include: LOCATION_COUNT_INCLUDE,
  });
  if (!existing) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const force = new URL(request.url).searchParams.get("force") === "true";
  const ownershipCount = existing._count.ownerships;
  const visitCount = existing._count.visits;
  if ((ownershipCount > 0 || visitCount > 0) && !force) {
    return NextResponse.json(
      {
        error:
          "This property has game history. Deleting it removes who owns it and its check-in history.",
        needsConfirm: true,
        ownershipCount,
        visitCount,
      },
      { status: 409 },
    );
  }

  await prisma.$transaction([
    prisma.propertyOwnership.deleteMany({ where: { locationId: id } }),
    prisma.visit.deleteMany({ where: { locationId: id } }),
    prisma.location.delete({ where: { id } }),
  ]);
  await removeLandmarkPhotoFile(existing.landmarkImageUrl);

  return NextResponse.json({ ok: true });
}
