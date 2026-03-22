import { API_BASE_URL } from "./config"
const BASE_URL = API_BASE_URL; // your backend IP

export async function addSong(rideId: string, trackId: string) {
  const res = await fetch(`${BASE_URL}/rides/${rideId}/songs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ trackId }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  console.log("addSong response:", res);

  return res.json();
}