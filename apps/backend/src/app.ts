import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { rideRoutes } from "./modules/rides/ride.routes";
import { songsRoutes } from "./modules/songs/song.routes";
import { spotifyRoutes } from "./modules/spotify/spotify.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import websocket from "@fastify/websocket";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(websocket);

  await app.register(cors as any, {
    origin: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? "riderdj-dev-secret",
  });

  app.get("/health", async () => ({
    status: "ok",
    BACKEND_URL: process.env.BACKEND_URL ?? "(not set)",
  }));

  await app.register(authRoutes);
  await app.register(rideRoutes);
  await app.register(songsRoutes);
  await app.register(spotifyRoutes);

  console.log("spotifyRoutes:", spotifyRoutes);

  return app;
}

// Exported preHandler — attach to any route that requires a logged-in driver
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}
