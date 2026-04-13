import { API_BASE_URL } from "./config"

const BASE_URL = API_BASE_URL; // your backend IP

export async function createRide(rideId: string) {
  const response = await fetch(`${BASE_URL}/rides`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: rideId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to create ride");
  }

  return response.json();
}

export async function joinRide(rideId: string, passengerName: string) {
  const response = await fetch(`${BASE_URL}/rides/${rideId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ passengerName }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to join ride");
  }

  return response.json();
}

export async function getQueue(rideId: string) {
  const res = await fetch(`${API_BASE_URL}/rides/${rideId}/queue`)

  if (!res.ok) {
    throw new Error("Failed to fetch queue")
  }

  return res.json()
}

export async function removeSong(songId: string) {
  const res = await fetch(`${BASE_URL}/songs/${songId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("removeSong error:", text);
    throw new Error("Failed to remove song");
  }

  return res.json();
}

export async function endRide(rideId: string) {
  const res = await fetch(`${BASE_URL}/rides/${rideId}/end`, {
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("endRide error:", text);
    throw new Error("Failed to end ride");
  }

  return res.json();
}