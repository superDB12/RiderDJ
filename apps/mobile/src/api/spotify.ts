import { API_BASE_URL } from "./config"

export async function searchSpotify(rideId: string, query: string) {
  const res = await fetch(
    `${API_BASE_URL}/spotify/search?q=${encodeURIComponent(query)}&rideId=${encodeURIComponent(rideId)}`
  );

  if (!res.ok) {
    throw new Error("Search failed");
  }

  return res.json();
}