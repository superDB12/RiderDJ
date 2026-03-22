import { SPOTIFY_API_BASE } from "./config"

export async function searchSpotify(query: string, accessToken: string) {
  const res = await fetch(`${SPOTIFY_API_BASE}/search?type=track&q=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    throw new Error("Failed to search Spotify");
  }

  const data = await res.json();
  return data.tracks.items; // array of tracks
}