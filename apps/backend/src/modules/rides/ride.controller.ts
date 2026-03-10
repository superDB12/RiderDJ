import { FastifyRequest, FastifyReply } from "fastify";
import { startRide, joinRide } from "./ride.service";

export async function createRide(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const ride = await startRide();
  return ride;
}

export async function getRide(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { joinCode } = request.params as { joinCode: string }

  try {
    const ride = await joinRide(joinCode)

    return ride
  } catch {
    return reply.status(404).send({
      error: "Ride not found"
    })
  }
}