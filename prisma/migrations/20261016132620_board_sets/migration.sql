-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "boardSet" TEXT NOT NULL DEFAULT 'LONDON_FULL',
    "status" TEXT NOT NULL DEFAULT 'SETUP',
    "startingBalance" INTEGER NOT NULL DEFAULT 1500,
    "geofenceRadiusM" INTEGER NOT NULL DEFAULT 120,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Game" ("createdAt", "geofenceRadiusM", "id", "name", "startingBalance", "status", "updatedAt") SELECT "createdAt", "geofenceRadiusM", "id", "name", "startingBalance", "status", "updatedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE TABLE "new_Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardSet" TEXT NOT NULL DEFAULT 'LONDON_FULL',
    "name" TEXT NOT NULL,
    "colorGroup" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "rent" INTEGER NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "boardOrder" INTEGER NOT NULL
);
INSERT INTO "new_Location" ("boardOrder", "colorGroup", "id", "latitude", "longitude", "name", "price", "rent") SELECT "boardOrder", "colorGroup", "id", "latitude", "longitude", "name", "price", "rent" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
CREATE UNIQUE INDEX "Location_boardSet_name_key" ON "Location"("boardSet", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
