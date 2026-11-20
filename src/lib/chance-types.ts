export type ChanceSubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type TeamChanceCard = {
  id: string;
  activity: string;
  reward: number;
  deadlineAt: string;
  submission: { status: ChanceSubmissionStatus } | null;
};

export type AdminChanceSubmission = {
  id: string;
  teamId: string;
  teamName: string;
  selfiePath: string;
  status: ChanceSubmissionStatus;
  submittedAt: string;
};

export type AdminChanceCard = {
  id: string;
  activity: string;
  reward: number;
  deadlineAt: string;
  createdAt: string;
  submissions: AdminChanceSubmission[];
};
