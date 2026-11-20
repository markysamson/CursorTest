import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  decision: z.enum(["approve", "reject"]),
});

export async function POST(request: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose approve or reject." }, { status: 400 });
  }

  const game = await prisma.game.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!game) {
    return NextResponse.json({ error: "No game." }, { status: 404 });
  }

  const submission = await prisma.chanceSubmission.findUnique({
    where: { id },
    include: { chanceCard: true },
  });
  if (!submission || submission.chanceCard.gameId !== game.id) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }
  if (submission.status !== "PENDING") {
    return NextResponse.json({ error: "This photo has already been reviewed." }, { status: 409 });
  }

  if (parsed.data.decision === "reject") {
    const updated = await prisma.chanceSubmission.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "REJECTED", reviewedAt: new Date() },
    });
    if (updated.count !== 1) {
      return NextResponse.json({ error: "This photo has already been reviewed." }, { status: 409 });
    }
    return NextResponse.json({ ok: true, status: "REJECTED" });
  }

  try {
    const balance = await prisma.$transaction(async (tx) => {
      const updated = await tx.chanceSubmission.updateMany({
        where: { id, status: "PENDING" },
        data: { status: "APPROVED", reviewedAt: new Date() },
      });
      if (updated.count !== 1) {
        throw new Error("already-reviewed");
      }
      const team = await tx.team.update({
        where: { id: submission.teamId },
        data: { balance: { increment: submission.chanceCard.reward } },
        select: { balance: true },
      });
      return team.balance;
    });
    return NextResponse.json({ ok: true, status: "APPROVED", balance });
  } catch (error) {
    if (error instanceof Error && error.message === "already-reviewed") {
      return NextResponse.json({ error: "This photo has already been reviewed." }, { status: 409 });
    }
    throw error;
  }
}
