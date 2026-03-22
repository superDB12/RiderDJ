import Fastify from "fastify";
import cors from "@fastify/cors";
import { rideRoutes } from "./modules/rides/ride.routes";
import { songsRoutes } from "./modules/songs/song.routes";
import * as dotenv from "dotenv";

dotenv.config();

export async function buildApp() {
  const app = Fastify({ logger: true });

  // ✅ REGISTER CORS (this is the missing piece)
  await app.register(cors as any, {
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(rideRoutes);
  await app.register(songsRoutes);

  return app;
}
