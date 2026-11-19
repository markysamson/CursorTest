-- AlterTable
ALTER TABLE "Game" ADD COLUMN "showTeamMap" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN "landmarkImageUrl" TEXT;
