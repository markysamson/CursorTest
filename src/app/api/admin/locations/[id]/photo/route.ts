import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LOCATION_COUNT_INCLUDE, toAdminLocation } from "@/lib/admin-locations";
import { removeLandmarkPhotoFile, saveLandmarkPhoto } from "@/lib/upload";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.location.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  }

  let url: string;
  try {
    url = await saveLandmarkPhoto(file, id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save photo." },
      { status: 400 },
    );
  }

  const updated = await prisma.location.update({
    where: { id },
    data: { landmarkImageUrl: url },
    include: LOCATION_COUNT_INCLUDE,
  });
  await removeLandmarkPhotoFile(existing.landmarkImageUrl);

  return NextResponse.json({ location: toAdminLocation(updated) });
}
