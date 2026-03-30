import { Song } from "@riderdj/types"

// Map of rideId -> array of SongRequests
const songQueue = new Map<string, Song[]>();

export async function getQueue(rideId: string) {
  return songQueue.get(rideId) || [];
}

// 🔥 UPDATED: now accepts full song object
export async function requestSong(rideId: string, song: Song) {
  if (!songQueue.has(rideId)) {
    songQueue.set(rideId, []);
  }

  songQueue.get(rideId)!.push(song);

  return song;
}
