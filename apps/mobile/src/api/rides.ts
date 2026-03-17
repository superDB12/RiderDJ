import { API_BASE_URL } from "./config"

export async function joinRide(rideId: string) {
  const res = await fetch(`${API_BASE_URL}/rides/${rideId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (!res.ok) {
    throw new Error("Failed to join ride")
  }

  return res.json()
}

export async function getQueue(rideId: string) {
  const res = await fetch(`${API_BASE_URL}/rides/${rideId}/queue`)

  if (!res.ok) {
    throw new Error("Failed to fetch queue")
  }

  return res.json()
}