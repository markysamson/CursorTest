-- AlterTable
ALTER TABLE "Location" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN "wikidataId" TEXT;
