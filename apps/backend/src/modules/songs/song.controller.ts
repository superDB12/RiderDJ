import { getQueue, requestSong } from "./song.service"
import { FastifyRequest, FastifyReply } from "fastify"
import { Song } from "@riderdj/types"
import { getTrackMetadata } from "../spotify/spotify.service"
import crypto from "crypto";
import { broadcastQueue } from "../rides/ride.service";
import { prisma } from "../../infrastructure/database/prisma";

// Example in-memory storage
const driverTokens = {
  accessToken: process.env.DRIVER_ACCESS_TOKEN!,
  refreshToken: process.env.DRIVER_REFRESH_TOKEN!,
}

export async function getRideQueue(request: FastifyRequest) {

  const { rideId } = request.params as { rideId: string }

  const queue = await getQueue(rideId)

  return queue
}

export async function addSong(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { rideId } = request.params as { rideId: string };
    const { trackId } = request.body as { trackId: string };

    if (!trackId) {
      return reply.status(400).send({ error: "trackId is required" });
    }

    // 🔥 NEW: fetch metadata from Spotify
    const metadata = await getTrackMetadata(rideId, trackId);

    // 🔥 NEW: build full song object
    const song = {
      id: crypto.randomUUID(),
      rideId,
      trackId,
      title: metadata.title,
      artist: metadata.artist,
      albumArt: metadata.albumArt,
      votes: 0,
      addedAt: new Date().toISOString(),
    };

    // 🔥 IMPORTANT: store THIS instead of just trackId
    await requestSong(rideId, song);

    broadcastQueue(rideId);

    return reply.status(201).send({ status: "queued", song });
  } catch (err) {
    console.error("FULL ERROR:", err);

  return reply.status(500).send({
    error: "Failed to add song",
    message: err instanceof Error ? err.message : "Unknown error",
  });
  }
}

export async function removeSong(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { songId } = request.params as { songId: string };

    if (!songId) {
      return reply.status(400).send({ error: "songId is required" });
    }

    // delete song from DB
    const deleted = await prisma.song.delete({
      where: { id: songId },
    });

    // broadcast updated queue
    await broadcastQueue(deleted.rideId);

    return reply.send({ success: true });
  } catch (err) {
    console.error("❌ removeSong error:", err);
    return reply.status(500).send({ error: "Failed to remove song" });
  }
}

