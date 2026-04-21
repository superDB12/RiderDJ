// ride.controller.ts
import { FastifyReply, FastifyRequest } from "fastify";
import { getQueue } from "../songs/song.service";
import { broadcastQueue } from "./ride.service";
import { prisma } from "../../infrastructure/database/prisma";

// Create a new ride
const RIDE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function createRide(request: FastifyRequest<{ Body: { id?: string } }>, reply: FastifyReply) {
  const { id } = request.body ?? {};

  const ride = await prisma.ride.create({
    data: {
      ...(id ? { id } : {}),
      isActive: true,
      rideExpiresAt: new Date(Date.now() + RIDE_TTL_MS),
    },
  });

  return reply.status(201).send({ id: ride.id });
}

// Join an existing ride
export async function joinRide(request: FastifyRequest<{ Params: { rideId: string } }>, reply: FastifyReply) {
  const { rideId } = request.params;

  const ride = await prisma.ride.findUnique({ where: { id: rideId } });

  const expired = ride?.rideExpiresAt && ride.rideExpiresAt < new Date();
  if (!ride || !ride.isActive || expired) {
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

export async function getActiveRides(request: FastifyRequest, reply: FastifyReply) {
  const rides = await prisma.ride.findMany({
    where: {
      isActive: true,
      rideExpiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true },
  });

  return reply.send({ rides });
}

export async function endRide(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { rideId } = request.params as { rideId: string };

    await prisma.ride.update({
      where: { id: rideId },
      data: { isActive: false },
    });

    await prisma.song.deleteMany({ where: { rideId } });

    await broadcastQueue(rideId);

    return reply.send({ success: true });
  } catch (err) {
    console.error("❌ endRide error:", err);
    return reply.status(500).send({ error: "Failed to end ride" });
  }
}