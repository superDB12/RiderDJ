import { FastifyInstance } from "fastify";
import { createRide, joinRide } from "./ride.controller";
import { rides } from "@riderdj/types";

export async function rideRoutes(app: FastifyInstance) {

  app.post("/rides", createRide)

  app.post("/rides/:rideId/join", joinRide)

  // ✅ list all rides
  app.get("/rides", async (request, reply) => {
    // return an array of rides (not the object keys)
    return reply.send(Object.values(rides));
  });
}