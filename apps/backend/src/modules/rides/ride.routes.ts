import { FastifyInstance } from "fastify";
import { createRide, joinRide, endRide, getActiveRides } from "./ride.controller";
import { rideSockets } from "./ride.store";
import { getRideWebPage } from "./ride.web";
import { getCurrentlyPlayingFull } from "../spotify/spotify.service";
import { authenticate } from "../../app";
import { prisma } from "../../infrastructure/database/prisma";

const deepLinkHtml = (deepLink: string, webFallback: string) => `<!DOCTYPE html>
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
      window.location.href = "${deepLink}";
      setTimeout(function() { window.location.replace("${webFallback}"); }, 1500);
    </script>
  </body>
</html>`;

const noActiveRideHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>RiderDJ</title>
    <style>
      body { font-family: -apple-system, sans-serif; background: #07060f; color: #f0eaff;
             display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
      .box { text-align: center; padding: 32px 24px; }
      .logo { font-size: 26px; font-weight: 900; letter-spacing: 2px; margin-bottom: 8px; }
      .tagline { font-size: 11px; letter-spacing: 4px; color: #06b6d4; font-weight: 600; margin-bottom: 32px; }
      p { color: #8b7aa8; font-size: 15px; }
    </style>
  </head>
  <body>
    <div class="box">
      <div class="logo">RiderDJ</div>
      <div class="tagline">YOUR RIDE. YOUR MUSIC.</div>
      <p>No active ride right now.<br/>Ask your driver to start a ride!</p>
    </div>
  </body>
</html>`;

export async function rideRoutes(app: FastifyInstance) {

  // ── Protected routes ──────────────────────────────────────
  app.post("/rides", { preHandler: [authenticate] }, createRide);
  app.get("/rides", { preHandler: [authenticate] }, getActiveRides);
  app.post("/rides/:rideId/end", { preHandler: [authenticate] }, endRide);

  // ── Public routes ─────────────────────────────────────────
  app.post("/rides/:rideId/join", joinRide);

  // Static QR — resolves driverId to current active ride
  app.get("/join/driver/:driverId", async (req, reply) => {
    const { driverId } = req.params as { driverId: string };
    const ride = await prisma.ride.findFirst({
      where: { driverId, isActive: true, rideExpiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!ride) {
      return reply.header("Content-Type", "text/html").send(noActiveRideHtml);
    }
    const deepLink = `riderdj://join/${ride.id}`;
    const webFallback = `${process.env.BACKEND_URL ?? ""}/ride/${ride.id}`;
    return reply.header("Content-Type", "text/html").send(deepLinkHtml(deepLink, webFallback));
  });

  // Legacy per-ride deep link (still works for direct share)
  app.get("/join/:rideId", (req, reply) => {
    const { rideId } = req.params as { rideId: string };
    const deepLink = `riderdj://join/${rideId}`;
    const webFallback = `${process.env.BACKEND_URL ?? ""}/ride/${rideId}`;
    return reply.header("Content-Type", "text/html").send(deepLinkHtml(deepLink, webFallback));
  });

  app.get("/ride/:rideId", (req, reply) => {
    const { rideId } = req.params as { rideId: string };
    return reply.header("Content-Type", "text/html").send(getRideWebPage(rideId));
  });

  app.get("/rides/:rideId/now-playing", async (req, reply) => {
    const { rideId } = req.params as { rideId: string };
    try {
      const track = await getCurrentlyPlayingFull(rideId);
      return reply.send(track ?? null);
    } catch {
      return reply.send(null);
    }
  });

  // ── WebSocket ─────────────────────────────────────────────
  app.get("/rides/:rideId/ws", { websocket: true }, (connection, req) => {
    const { rideId } = req.params as { rideId: string };
    const socket = connection.socket;

    if (!rideSockets.has(rideId)) {
      rideSockets.set(rideId, new Set());
    }
    rideSockets.get(rideId)!.add(socket);
    console.log("🔌 Connected:", rideId, "| total:", rideSockets.get(rideId)!.size);

    socket.on("message", (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "ping") socket.send(JSON.stringify({ type: "pong" }));
      } catch {}
    });

    const pingInterval = setInterval(() => {
      if (socket.readyState === socket.OPEN) socket.ping();
    }, 30000);

    socket.on("close", () => {
      clearInterval(pingInterval);
      rideSockets.get(rideId)?.delete(socket);
      console.log("❌ Disconnected:", rideId, "| remaining:", rideSockets.get(rideId)?.size ?? 0);
    });
  });
}
