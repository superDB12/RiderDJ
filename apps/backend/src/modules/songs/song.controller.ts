import { getQueue, requestSong } from "./song.service"
import { FastifyRequest, FastifyReply } from "fastify"
import { Song } from "@riderdj/types"
import { addToSpotifyQueue } from "../spotify/spotify.service"
import crypto from "crypto"
import { getTrackMetadata } from "../spotify/spotify.service";

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
    const metadata = await getTrackMetadata(trackId);

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
    await requestSong(rideId, song); // 👈 changed this line

    // Queue the song in Spotify
    try {
      await addToSpotifyQueue(`spotify:track:${trackId}`);
    } catch (err) {
      console.error("Failed to queue song in Spotify:", err);
    }

    return reply.status(201).send({ status: "queued", song });
  } catch (err) {
    console.error("Error adding song:", err);
    return reply.status(500).send({ error: "Failed to add song" });
  }
}

