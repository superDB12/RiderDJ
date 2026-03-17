import { FastifyInstance } from "fastify";
import { createRide, getRide } from "./ride.controller";

export async function rideRoutes(app: FastifyInstance) {

  app.post("/rides", createRide)

  app.get("/rides/:joinCode/join", getRide)

}