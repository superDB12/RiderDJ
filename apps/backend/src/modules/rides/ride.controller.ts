// ride.controller.ts
import { FastifyReply, FastifyRequest } from "fastify";
import { getQueue } from "../songs/song.service";
import { broadcastQueue } from "./ride.service";
import { prisma } from "../../infrastructure/database/prisma";

// Create a new ride
export async function createRide(request: FastifyRequest<{ Body: { id?: string } }>, reply: FastifyReply) {
  const { id } = request.body ?? {};

  const ride = await prisma.ride.create({
    data: { ...(id ? { id } : {}), isActive: true },
  });

  return reply.status(201).send({ id: ride.id });
}

// Join an existing ride
export async function joinRide(request: FastifyRequest<{ Params: { rideId: string }; Body: { passengerName: string } }>, reply: FastifyReply) {
  const { rideId } = request.params;
  const { passengerName } = request.body;

  if (!passengerName) {
    return reply.status(400).send("passengerName required");
  }

  const ride = await prisma.ride.findUnique({ where: { id: rideId } });

  if (!ride || !ride.isActive) {
    return reply.status(404).send("Ride not found");
  }

  return reply.send({ id: ride.id });
}

export async function getQueueController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { rideId } = request.params as { rideId: string };

  const queue = await getQueue(rideId);

  return reply.send({ songs: queue });
}

export async function endRide(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { rideId } = request.params as { rideId: string };

    if (!rideId) {
      return reply.status(400).send({ error: "rideId is required" });
    }

    // delete all songs for this ride
    await prisma.song.deleteMany({
      where: { rideId },
    });

    // broadcast empty queue
    await broadcastQueue(rideId);

    return reply.send({ success: true });
  } catch (err) {
    console.error("❌ endRide error:", err);
    return reply.status(500).send({ error: "Failed to end ride" });
  }
}