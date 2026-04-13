import { SpotifyTrack } from "@riderdj/types"
import { prisma } from "../../infrastructure/database/prisma";

// Replace with your Spotify app credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID as string;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET as string;

// Refresh access token if expired
export async function getValidAccessToken(rideId: string): Promise<string> {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
  });

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (!ride.accessToken || !ride.refreshToken || !ride.expiresAt) {
    throw new Error("Missing Spotify tokens for ride");
  }

  const isExpired = Date.now() >= new Date(ride.expiresAt).getTime();

  // ✅ still valid
  if (!isExpired) {
    return ride.accessToken;
  }

  console.log("🔄 Refreshing Spotify token for ride:", rideId);

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: ride.refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Spotify token refresh failed: ${res.statusText}`);
  }

  const data = await res.json();

  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000);

  // ✅ update DB
  await prisma.ride.update({
    where: { id: rideId },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? ride.refreshToken,
      expiresAt: newExpiresAt,
    },
  });

  return data.access_token;
}

// Add a song to the driver’s Spotify queue
export async function addToSpotifyQueue(rideId: string, trackId: string) {
  const accessToken = await getValidAccessToken(rideId);

  const res = await fetch(
    `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${trackId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("SPOTIFY QUEUE ERROR:", res.status, text);
    throw new Error("Failed to add to Spotify queue");
  }
}

export async function getTrackMetadata(rideId: string, trackId: string) {
  const accessToken = await getValidAccessToken(rideId);

  const res = await fetch(
    `https://api.spotify.com/v1/tracks/${trackId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("TRACK FETCH ERROR:", text);
    throw new Error("Failed to fetch track metadata");
  }

  const data = await res.json() as SpotifyTrack;
  console.log("TRACK DATA:", data);

  return {
    trackId: data.id,
    title: data.name,
    artist: data.artists.map((a: any) => a.name).join(", "),
    albumArt: data.album.images[0]?.url,
  };
}

export async function getCurrentlyPlaying(rideId: string) {
  const accessToken = await getValidAccessToken(rideId);

  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (res.status === 204) return null; // nothing playing

  if (!res.ok) {
    const text = await res.text();
    console.error("SPOTIFY ERROR:", text);
    return null;
  }

  const data = await res.json() as any;
  console.log("CURRENTLY PLAYING ID:", data.item.id);
  return data?.item?.id || null;
}



