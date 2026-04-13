import { Song } from "@riderdj/types"
import { syncQueueWithSpotify } from "../rides/ride.service";
import { randomUUID } from "crypto";
import { songQueue } from "../rides/ride.store";
import { broadcastQueue } from "../rides/ride.service";
import { prisma } from "../../infrastructure/database/prisma";


// Map of rideId -> array of SongRequests
//const songQueue = new Map<string, Song[]>();

export async function getQueue(rideId: string) {
  return prisma.song.findMany({
    where: { rideId },
    orderBy: { addedAt: "asc" },
  });
}

// 🔥 UPDATED: now accepts full song object
/*export async function requestSong(rideId: string, song: Song) {
  if (!songQueue.has(rideId)) {
    songQueue.set(rideId, []);
  }

  songQueue.get(rideId)!.push(song);

  return song;
}
  */
 
 export async function requestSong(rideId: string, songData: any) {
  const song = await prisma.song.create({
    data: {
      rideId,
      trackId: songData.trackId,
      title: songData.title,
      artist: songData.artist,
      albumArt: songData.albumArt,
      votes: 1,
      // addedAt handled automatically by Prisma
    },
  });

  console.log("✅ SONG ADDED:", song);

  // 🔥 fetch updated queue from DB (not memory!)
  const fullQueue = await prisma.song.findMany({
    where: { rideId },
    orderBy: { addedAt: "asc" },
  });

  console.log("📦 FULL QUEUE:", fullQueue);

  // 🔥 broadcast updated queue
  await broadcastQueue(rideId);

  return song;
}

