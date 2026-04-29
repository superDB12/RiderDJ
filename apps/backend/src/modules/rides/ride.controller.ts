// ride.controller.ts
import { FastifyReply, FastifyRequest } from "fastify";
import { getQueue } from "../songs/song.service";
import { broadcastQueue, closeRideSockets } from "./ride.service";
import { prisma } from "../../infrastructure/database/prisma";

const RIDE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function createRide(request: FastifyRequest<{ Body: { id?: string } }>, reply: FastifyReply) {
  const { driverId } = request.user as { driverId: string };
  const { id } = request.body ?? {};

  // Auto-close any existing active ride for this driver
  const existingRides = await prisma.ride.findMany({
    where: { driverId, isActive: true },
    select: { id: true },
  });

  for (const existing of existingRides) {
    await prisma.ride.update({ where: { id: existing.id }, data: { isActive: false } });
    await prisma.song.deleteMany({ where: { rideId: existing.id } });
    closeRideSockets(existing.id);
  }

  const ride = await prisma.ride.create({
    data: {
      ...(id ? { id } : {}),
      driverId,
      isActive: true,
      rideExpiresAt: new Date(Date.now() + RIDE_TTL_MS),
    },
  });

  return reply.status(201).send({ id: ride.id });
}

export async function joinRide(request: FastifyRequest<{ Params: { rideId: string } }>, reply: FastifyReply) {
  const { rideId } = request.params;

  const ride = await prisma.ride.findUnique({ where: { id: rideId } });

  const expired = ride?.rideExpiresAt && ride.rideExpiresAt < new Date();
  if (!ride || !ride.isActive || expired) {
    return reply.status(404).send("Ride not found");
  }

  return reply.send({ id: ride.id });
}

export async function getQueueController(request: FastifyRequest, reply: FastifyReply) {
  const { rideId } = request.params as { rideId: string };
  const queue = await getQueue(rideId);
  return reply.send({ songs: queue });
}

export async function getActiveRides(request: FastifyRequest, reply: FastifyReply) {
  const { driverId } = request.user as { driverId: string };

  const rides = await prisma.ride.findMany({
    where: {
      driverId,
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
    const { driverId } = request.user as { driverId: string };

    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride || ride.driverId !== driverId) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    await prisma.ride.update({ where: { id: rideId }, data: { isActive: false } });
    await prisma.song.deleteMany({ where: { rideId } });

    closeRideSockets(rideId);

    return reply.send({ success: true });
  } catch (err) {
    console.error("❌ endRide error:", err);
    return reply.status(500).send({ error: "Failed to end ride" });
  }
}
