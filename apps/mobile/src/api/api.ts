// apps/mobile/src/api/api.ts
const BASE_URL = "http://192.68.86.130:3000"

export async function createRide() {
  const res = await fetch(`${BASE_URL}/rides`, { method: "POST" })
  return res.json()
}

export async function joinRide(joinCode: string) {
  const res = await fetch(`${BASE_URL}/rides/${joinCode}`)
  return res.json()
}

export async function getQueue(rideId: string) {
  const res = await fetch(`${BASE_URL}/rides/${rideId}/queue`)
  return res.json()
}

export async function addSong(rideId: string, trackId: string) {
  const res = await fetch(`${BASE_URL}/rides/${rideId}/songs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trackId }),
  })
  return res.json()
}