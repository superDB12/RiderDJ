import { API_BASE_URL } from "./config"
import { getQueue } from "./rides"

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
    const body = await res.text();
    try {
      const json = JSON.parse(body);
      throw new Error(json.error || body);
    } catch (parseErr) {
      if (parseErr instanceof SyntaxError) throw new Error(body);
      throw parseErr;
    }
  }
  console.log("addSong response:", res);

  return res.json();
}