import { getQueue, requestSong } from "./song.service"
import { FastifyRequest, FastifyReply } from "fastify"
import { SongRequest } from "@riderdj/types"
import { addSongToDriverQueue } from "../spotify/spotify.service"

// Example in-memory storage
const driverTokens = {
  accessToken: process.env.DRIVER_ACCESS_TOKEN!,
  refreshToken: process.env.DRIVER_REFRESH_TOKEN!,
}

export async function getRideQueue(request: FastifyRequest) {

  const { rideId } = request.params as { rideId: string }

  const queue = await getQueue(rideId)

  return queue
}

export async function addSong(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { rideId } = request.params as { rideId: string }
    const { trackId } = request.body as { trackId: string }

    if (!trackId) {
      return reply.status(400).send({ error: "trackId is required" })
    }

    // Add song to in-memory queue
    const song = await requestSong(rideId, trackId)

    // Queue the song in Spotify
    try {
      // Spotify track URI format: spotify:track:<id>
      await addSongToDriverQueue(`spotify:track:${trackId}`, driverTokens)
    } catch (err) {
      console.error("Failed to queue song in Spotify:", err)
    }

    return reply.status(201).send({ status: "queued", song })
  } catch (err) {
    console.error("Error adding song:", err)
    return reply.status(500).send({ error: "Failed to add song" })
  }
}

