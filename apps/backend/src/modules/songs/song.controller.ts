import { getQueue, requestSong } from "./song.service"
import { FastifyRequest, FastifyReply } from "fastify"
import { SongRequest } from "@riderdj/types"

export async function getRideQueue(request: FastifyRequest) {

  const { rideId } = request.params as { rideId: string }

  const queue = await getQueue(rideId)

  return queue
}

export async function addSong(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Extract rideId from URL params
    const { rideId } = request.params as { rideId: string }

    // Extract trackId from request body
    const { trackId } = request.body as { trackId: string }

    // Validate input
    if (!trackId) {
      return reply.status(400).send({ error: "trackId is required" })
    }

    // Call the service to add the song to the ride queue
    const song: SongRequest = await requestSong(rideId, trackId)

    // Return confirmation
    return reply.status(201).send({
      status: "queued",
      song,
    })

  } catch (error) {
    console.error("Error adding song:", error)
    return reply.status(500).send({ error: "Failed to add song" })
  }
}

