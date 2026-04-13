import { randomUUID } from "crypto";
import { getCurrentlyPlaying } from "../spotify/spotify.service";
import { Song } from "@riderdj/types";
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

  const currentTrackId = await getCurrentlyPlaying();

  console.log("🎧 Spotify:", currentTrackId);
  console.log("📜 Queue BEFORE:", queue.map((s: Song) => s.trackId));

  if (!currentTrackId) return queue;

  if (queue[0]?.trackId === currentTrackId) {
    console.log("🗑 Removing:", currentTrackId);

    await prisma.song.delete({
      where: { id: queue[0].id },
    });

    broadcastQueue(rideId); // 🔥 still needed
  }

  const updatedQueue = await prisma.song.findMany({
    where: { rideId },
    orderBy: { addedAt: "asc" },
  });

  console.log("📜 Queue AFTER:", updatedQueue.map((s: Song) => s.trackId));

  return updatedQueue;
}

export function startQueueSync() {
  setInterval(async () => {
    console.log("⏱ Running queue sync...");

    for (const rideId of rideSockets.keys()) {
      console.log("🔁 Syncing ride:", rideId);
      await syncQueueWithSpotify(rideId);
    }
  }, 5000);
}