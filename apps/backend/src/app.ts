import Fastify from "fastify";
import cors, { FastifyCorsOptions } from "@fastify/cors";
import { rideRoutes } from "./modules/rides/ride.routes";
import { songsRoutes } from "./modules/songs/song.routes";
import * as dotenv from "dotenv";
import { fastifyCors } from "@fastify/cors";

dotenv.config();

export async function buildApp() {
  const app = Fastify({ logger: true });

  const corsOptions: FastifyCorsOptions = {
    origin: true, // allow all origins in dev
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflight: true, // ✅ respond to OPTIONS requests automatically
  };

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(rideRoutes);
  await app.register(songsRoutes);

  return app;
}

