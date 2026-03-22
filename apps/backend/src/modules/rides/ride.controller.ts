// ride.controller.ts
import { FastifyReply, FastifyRequest } from "fastify";
import { rides, Ride } from "@riderdj/types";

// Create a new ride
export async function createRide(request: FastifyRequest<{ Body: { driver: string } }>, reply: FastifyReply) {
  const { driver } = request.body;
  const id = Math.random().toString(36).substring(2, 6).toUpperCase(); // simple ride ID

  const newRide: Ride = { id, driverId: driver, passengers: [] };
  rides[id] = newRide;

  return reply.status(201).send(newRide);
}

// Join an existing ride
export async function joinRide(request: FastifyRequest<{ Params: { rideId: string }; Body: { passengerName: string } }>, reply: FastifyReply) {
  const { rideId } = request.params;
  const { passengerName } = request.body;

  if (!rides[rideId]) {
    return reply.status(404).send("Ride not found");
  }

  if (!passengerName) {
    return reply.status(400).send("passengerName required");
  }

  rides[rideId].passengers.push(passengerName);
  return reply.send(rides[rideId]);
}