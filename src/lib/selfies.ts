import { prisma } from "@/lib/db";

export type SelfieKind = "PURCHASE" | "RENT" | "PASS" | "CHANCE";

export type SelfieItem = {
  id: string;
  kind: SelfieKind;
  teamId: string;
  teamName: string;
  /** Property name, or the Chance card activity. */
  title: string;
  /** One line saying what happened, e.g. "Bought for £60". */
  detail: string;
  amount: number;
  colorGroup: string | null;
  /** Chance cards only. */
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
  selfiePath: string;
  createdAt: string;
};

/** Every team selfie in a game, newest first: property check-ins and Chance card photos. */
export async function listSelfies(gameId: string, teamId?: string): Promise<SelfieItem[]> {
  const [visits, submissions] = await Promise.all([
    prisma.visit.findMany({
      where: {
        gameId,
        ...(teamId ? { teamId } : {}),
        selfiePath: { not: null },
        visitType: { in: ["PURCHASE", "RENT", "PASS"] },
      },
      include: { team: { select: { name: true } }, location: true },
    }),
    prisma.chanceSubmission.findMany({
      where: {
        chanceCard: { gameId },
        ...(teamId ? { teamId } : {}),
      },
      include: { team: { select: { name: true } }, chanceCard: true },
    }),
  ]);

  const items: SelfieItem[] = [];

  for (const visit of visits) {
    if (!visit.selfiePath) continue;
    const kind = visit.visitType as "PURCHASE" | "RENT" | "PASS";
    items.push({
      id: `visit-${visit.id}`,
      kind,
      teamId: visit.teamId,
      teamName: visit.team.name,
      title: visit.location.name,
      detail:
        kind === "PURCHASE"
          ? `Bought for £${visit.amount}`
          : kind === "RENT"
            ? `Paid £${visit.amount} rent`
            : "Passed",
      amount: visit.amount,
      colorGroup: visit.location.colorGroup,
      status: null,
      selfiePath: visit.selfiePath,
      createdAt: visit.createdAt.toISOString(),
    });
  }

  for (const submission of submissions) {
    const outcome =
      submission.status === "APPROVED"
        ? `Approved, £${submission.chanceCard.reward} paid`
        : submission.status === "REJECTED"
          ? "Rejected"
          : "Waiting for review";
    items.push({
      id: `chance-${submission.id}`,
      kind: "CHANCE",
      teamId: submission.teamId,
      teamName: submission.team.name,
      title: submission.chanceCard.activity,
      detail: `Chance card · ${outcome}`,
      amount: submission.status === "APPROVED" ? submission.chanceCard.reward : 0,
      colorGroup: null,
      status: submission.status,
      selfiePath: submission.selfiePath,
      createdAt: submission.submittedAt.toISOString(),
    });
  }

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
