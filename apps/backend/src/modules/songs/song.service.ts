import { SongRequest } from "@riderdj/types"
import { randomUUID } from "crypto"

// Map of rideId -> array of SongRequests
const songQueue = new Map<string, SongRequest[]>()

export async function getQueue(rideId: string) {
  const queue = songQueue.get(rideId) || []

  return queue
}

export async function requestSong(rideId: string, trackId: string) {
  const song: SongRequest = {
    id: randomUUID(),
    rideId,
    trackId,
    votes: 1,
    addedAt: new Date()
  }

  if (!songQueue.has(rideId)) {
    songQueue.set(rideId, [])
  }

  songQueue.get(rideId)!.push(song)

  return song
}
