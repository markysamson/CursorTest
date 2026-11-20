import { getTeamSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveSelfie } from "@/lib/upload";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getTeamSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const chanceCardId = String(form?.get("chanceCardId") ?? "");
  const selfie = form?.get("selfie");
  if (!chanceCardId || !(selfie instanceof File) || selfie.size === 0) {
    return NextResponse.json({ error: "A photo of the activity is required." }, { status: 400 });
  }

  const [card, game] = await Promise.all([
    prisma.chanceCard.findUnique({
      where: { id: chanceCardId },
      include: { submissions: { where: { teamId: session.teamId } } },
    }),
    prisma.game.findUnique({ where: { id: session.gameId }, select: { status: true } }),
  ]);

  if (!card || card.gameId !== session.gameId) {
    return NextResponse.json({ error: "That Chance card is not part of this run." }, { status: 404 });
  }
  if (!game || game.status === "FINISHED") {
    return NextResponse.json({ error: "This run has ended." }, { status: 409 });
  }
  if (card.deadlineAt.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "The time limit for this Chance card has passed." },
      { status: 409 },
    );
  }

  const existing = card.submissions[0];
  if (existing?.status === "PENDING") {
    return NextResponse.json(
      { error: "Your photo is already waiting for the manager to review it." },
      { status: 409 },
    );
  }
  if (existing?.status === "APPROVED") {
    return NextResponse.json({ error: "Your team has already been paid for this Chance card." }, { status: 409 });
  }

  let selfiePath: string;
  try {
    selfiePath = await saveSelfie(selfie, session.gameId);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save the photo." },
      { status: 400 },
    );
  }

  if (existing) {
    await prisma.chanceSubmission.update({
      where: { id: existing.id },
      data: {
        selfiePath,
        status: "PENDING",
        submittedAt: new Date(),
        reviewedAt: null,
      },
    });
  } else {
    try {
      await prisma.chanceSubmission.create({
        data: {
          chanceCardId: card.id,
          teamId: session.teamId,
          selfiePath,
        },
      });
    } catch {
      return NextResponse.json(
        { error: "Your photo is already waiting for the manager to review it." },
        { status: 409 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
