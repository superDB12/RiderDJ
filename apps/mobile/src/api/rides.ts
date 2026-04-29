import { API_BASE_URL } from "./config";
import { authFetch } from "./api";

export async function getActiveRides(): Promise<{ id: string; createdAt: string }[]> {
  const res = await authFetch("/rides");
  if (!res.ok) throw new Error("Failed to fetch rides");
  const data = await res.json();
  return data.rides;
}

export async function createRide(rideId: string) {
  const res = await authFetch("/rides", {
    method: "POST",
    body: JSON.stringify({ id: rideId }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create ride");
  }
  return res.json();
}

export async function joinRide(rideId: string) {
  const response = await fetch(`${API_BASE_URL}/rides/${rideId}/join`, {
    method: "POST",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to join ride");
  }
  return response.json();
}

export async function getQueue(rideId: string) {
  const res = await fetch(`${API_BASE_URL}/rides/${rideId}/queue`);
  if (!res.ok) throw new Error("Failed to fetch queue");
  return res.json();
}

export async function removeSong(songId: string) {
  const res = await authFetch(`/songs/${songId}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    console.error("removeSong error:", text);
    throw new Error("Failed to remove song");
  }
  return res.json();
}

export async function endRide(rideId: string) {
  const res = await authFetch(`/rides/${rideId}/end`, { method: "POST" });
  if (!res.ok) {
    const text = await res.text();
    console.error("endRide error:", text);
    throw new Error("Failed to end ride");
  }
  return res.json();
}

export async function getNowPlaying(rideId: string): Promise<{
  trackId: string; title: string; artist: string;
  albumArt: string | null; isPlaying: boolean;
} | null> {
  const res = await fetch(`${API_BASE_URL}/rides/${rideId}/now-playing`);
  if (!res.ok) return null;
  return res.json();
}
