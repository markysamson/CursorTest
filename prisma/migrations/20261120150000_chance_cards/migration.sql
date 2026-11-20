-- CreateTable
CREATE TABLE "ChanceCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "reward" INTEGER NOT NULL,
    "deadlineAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChanceCard_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChanceSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chanceCardId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "selfiePath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    CONSTRAINT "ChanceSubmission_chanceCardId_fkey" FOREIGN KEY ("chanceCardId") REFERENCES "ChanceCard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChanceSubmission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ChanceCard_gameId_idx" ON "ChanceCard"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "ChanceSubmission_chanceCardId_teamId_key" ON "ChanceSubmission"("chanceCardId", "teamId");
