import { API_BASE_URL } from "./config"

export async function searchSpotify(query: string) {
  const res = await fetch(
    `${API_BASE_URL}/spotify/search?q=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    throw new Error("Search failed");
  }

  return res.json();
}

export async function pushToSpotify(trackId: string) {
  const res = await fetch(`${API_BASE_URL}/spotify/queue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ trackId }),
  });

  if (!res.ok) {
    throw new Error("Failed to push to Spotify");
  }

  return res.json();
}