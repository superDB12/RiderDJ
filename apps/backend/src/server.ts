import { buildApp } from "./app";

async function start() {
  const app = await buildApp();

  await app.listen({ port: 3000 });

  console.log("Server running on http://localhost:3000");
  console.log(app.printRoutes());
}

start();

