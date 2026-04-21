import { FastifyInstance } from "fastify";
import { createRide, joinRide, endRide, getActiveRides } from "./ride.controller";
import { rideSockets } from "./ride.store";
import { getRideWebPage } from "./ride.web";

export async function rideRoutes(app: FastifyInstance) {

  app.post("/rides", createRide)

  app.get("/rides", getActiveRides)

  app.post("/rides/:rideId/join", joinRide)

  app.get("/join/:rideId", (req, reply) => {
    const { rideId } = req.params as { rideId: string };
    const deepLink = `riderdj://join/${rideId}`;
    const webFallback = `${process.env.BACKEND_URL ?? ""}/ride/${rideId}`;
    return reply
      .header("Content-Type", "text/html")
      .send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Opening RiderDJ...</title>
    <style>
      body { font-family: -apple-system, sans-serif; background: #0f0f0f; color: #f0f0f0;
             display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
      .box { text-align: center; padding: 32px 24px; }
      p { color: #888; margin: 12px 0 24px; font-size: 15px; }
      a { color: #1db954; font-size: 15px; }
    </style>
  </head>
  <body>
    <div class="box">
      <h2>🎵 Opening RiderDJ...</h2>
      <p>If the app doesn't open, you'll be taken to the web version.</p>
      <a href="${webFallback}">Open web version now</a>
    </div>
    <script>
      // Try to open the native app
      window.location.href = "${deepLink}";

      // If the app isn't installed, the page stays visible — redirect to web after 1.5s
      setTimeout(function() {
        window.location.replace("${webFallback}");
      }, 1500);
    </script>
  </body>
</html>`);
  });

  app.post("/rides/:rideId/end", endRide);

  app.get("/ride/:rideId", (req, reply) => {
    const { rideId } = req.params as { rideId: string };
    return reply.header("Content-Type", "text/html").send(getRideWebPage(rideId));
  });  

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