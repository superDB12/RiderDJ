import fetch from "node-fetch"
import { SpotifyTokens, SpotifyTrack } from "@riderdj/types"
import { getTokens, setTokens } from "./token.store";

// Replace with your Spotify app credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID as string;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET as string;

// Refresh access token if expired
export async function getValidAccessToken(): Promise<string> {
  const tokens = getTokens();

  if (!tokens) {
    throw new Error("No Spotify tokens found");
  }

  const isExpired = Date.now() >= tokens.expires_in;

  if (!isExpired) {
    return tokens.access_token;
  }

  console.log("🔄 Refreshing Spotify token...");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token,
    }),
  });

  if (!res.ok) {
    throw new Error(`Spotify token refresh failed: ${res.statusText}`);
  }

  const data = await res.json() as SpotifyTokens;

  // 🔥 update stored tokens
  setTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? tokens.refresh_token, // Spotify may not return a new one
    expires_in: data.expires_in,
  });
  console.log("TOKENS:", data);
  return data.access_token;
}

// Add a song to the driver’s Spotify queue
export async function addToSpotifyQueue(trackId: string) {
  const accessToken = await getValidAccessToken();

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

export async function getTrackMetadata(trackId: string) {
  const accessToken = await getValidAccessToken();

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

export async function getCurrentlyPlaying() {
  const accessToken = await getValidAccessToken();

  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json() as { item: SpotifyTrack };
  return data?.item?.id || null;
}



