import { API_BASE_URL } from "./config"

const BASE_URL = API_BASE_URL; // your backend IP

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