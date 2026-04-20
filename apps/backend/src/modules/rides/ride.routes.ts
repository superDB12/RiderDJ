import { FastifyInstance } from "fastify";
import { createRide, joinRide, endRide } from "./ride.controller";
import { rideSockets } from "./ride.store";

export async function rideRoutes(app: FastifyInstance) {

  app.post("/rides", createRide)

  app.post("/rides/:rideId/join", joinRide)

  app.get("/join/:rideId", (req, reply) => {
    const { rideId } = req.params as { rideId: string };
    const deepLink = `riderdj://join/${rideId}`;
    return reply
      .header("Content-Type", "text/html")
      .send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Opening RiderDJ...</title>
    <meta http-equiv="refresh" content="0;url=${deepLink}" />
    <script>window.location.replace("${deepLink}");</script>
  </head>
  <body>
    <p>Opening RiderDJ... <a href="${deepLink}">tap here if it doesn't open</a></p>
  </body>
</html>`);
  });

  app.post("/rides/:rideId/end", endRide);  

app.get("/rides/:rideId/ws", { websocket: true }, (connection, req) => {
  const { rideId } = req.params as { rideId: string };
  const socket = connection.socket;

  if (!rideSockets.has(rideId)) {
    rideSockets.set(rideId, new Set());
  }

  rideSockets.get(rideId)!.add(socket);

  console.log("🔌 Connected:", rideId, "| total:", rideSockets.get(rideId)!.size);

  // Respond to application-level pings so the client's stale-connection detector works
  socket.on("message", (raw: Buffer) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "ping") {
        socket.send(JSON.stringify({ type: "pong" }));
      }
    } catch {}
  });

  // WS-protocol-level ping every 30s as a secondary keepalive for Railway's proxy
  const pingInterval = setInterval(() => {
    if (socket.readyState === socket.OPEN) {
      socket.ping();
    }
  }, 30000);

  socket.on("close", () => {
    clearInterval(pingInterval);
    rideSockets.get(rideId)?.delete(socket);
    console.log("❌ Disconnected:", rideId, "| remaining:", rideSockets.get(rideId)?.size ?? 0);
  });
});

}