import Fastify from "fastify";
import { rideRoutes } from "./modules/rides/ride.routes";
import { songsRoutes } from "./modules/songs/song.routes";

export async function buildApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  await app.register(rideRoutes, songsRoutes );

  return app;
}