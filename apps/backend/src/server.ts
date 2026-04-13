import 'dotenv/config';
import { buildApp } from "./app";
import { startQueueSync } from "./modules/rides/ride.service";

async function start() {
  const app = await buildApp();

  const port = parseInt(process.env.PORT || "3000");
  await app.listen({ port, host: "0.0.0.0" });

  console.log("Server running on http://localhost:3000");
  console.log(app.printRoutes());
  console.log("🚀 SERVER STARTED FROM server.ts");

  startQueueSync();
}

start();
