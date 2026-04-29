-- CreateTable: Driver
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Driver_email_key" ON "Driver"("email");

-- Drop existing tables (order matters for FK constraints)
DROP TABLE IF EXISTS "Song";
DROP TABLE IF EXISTS "Ride";

-- CreateTable: Ride (with driverId FK)
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rideExpiresAt" TIMESTAMP(3),
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId")
        REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: Song (with rideId FK)
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "albumArt" TEXT,
    "votes" INTEGER NOT NULL DEFAULT 1,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "queuedInSpotify" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Song_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Song_rideId_fkey" FOREIGN KEY ("rideId")
        REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
