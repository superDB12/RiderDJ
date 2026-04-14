import { randomUUID } from "crypto";
import { getCurrentlyPlaying, addToSpotifyQueue } from "../spotify/spotify.service";
import { rideSockets, songQueue } from "./ride.store";
import { prisma } from "../../infrastructure/database/prisma";

interface Ride {
  rideId: string
  joinCode: string
  queueLength: number
  maxQueueSize: number
}



const rides = new Map<string, Ride>()

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

export async function broadcastQueue(rideId: string) {
  const sockets = rideSockets.get(rideId);

  if (!sockets || sockets.size === 0) return;

  const queue = await prisma.song.findMany({
    where: { rideId },
    orderBy: { addedAt: "asc" },
  });

  const payload = JSON.stringify({ songs: queue });

  for (const socket of sockets) {
    socket.send(payload);
  }
}

export async function startRide() {
  const ride: Ride = {
    rideId: randomUUID(),
    joinCode: generateJoinCode(),
    queueLength: 0,
    maxQueueSize: 5
  }

  rides.set(ride.joinCode, ride)

  return ride
}

export async function joinRide(joinCode: string) {
  const ride = rides.get(joinCode)

  if (!ride) {
    throw new Error("Ride not found")
  }

  return ride
}

export async function syncQueueWithSpotify(rideId: string) {
  const queue = await prisma.song.findMany({
    where: { rideId },
    orderBy: { addedAt: "asc" },
  });

  if (queue.length === 0) return queue;

  const currentTrackId = await getCurrentlyPlaying(rideId);

  // If the front of our queue is now playing, remove it — it's done
  if (currentTrackId && queue[0]?.trackId === currentTrackId) {
    console.log("🗑 Removing played song:", currentTrackId);
    await prisma.song.delete({ where: { id: queue[0].id } });
    await broadcastQueue(rideId);

    // Re-fetch so we send the next song below
    queue.shift();
  }

  // Send the front of the queue to Spotify if it hasn't been sent yet
  const next = queue[0];
  if (next && !next.queuedInSpotify) {
    try {
      const cleanTrackId = next.trackId.replace("spotify:track:", "");
      await addToSpotifyQueue(rideId, cleanTrackId);
      await prisma.song.update({
        where: { id: next.id },
        data: { queuedInSpotify: true },
      });
      console.log("🎵 Queued in Spotify:", next.title);
    } catch (err) {
      console.error("Failed to queue in Spotify:", err);
    }
  }

  return queue;
}

async function expireOldRides() {
  const expired = await prisma.ride.findMany({
    where: {
      isActive: true,
      rideExpiresAt: { lt: new Date() },
    },
    select: { id: true },
  });

  for (const { id } of expired) {
    await prisma.ride.update({ where: { id }, data: { isActive: false } });
    await prisma.song.deleteMany({ where: { rideId: id } });
    await broadcastQueue(id);
    console.log(`⏰ Ride ${id} expired and closed`);
  }
}

export function startQueueSync() {
  setInterval(async () => {
    console.log("⏱ Running queue sync...");

    await expireOldRides();

    for (const rideId of rideSockets.keys()) {
      console.log("🔁 Syncing ride:", rideId);
      await syncQueueWithSpotify(rideId);
    }
  }, 5000);
}