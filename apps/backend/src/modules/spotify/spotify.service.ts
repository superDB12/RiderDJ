import fetch from "node-fetch"
import { SpotifyTokenResponse } from "@riderdj/types"

interface SpotifyTokens {
  accessToken: string
  refreshToken: string
}

// Replace with your Spotify app credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!

console.log(SPOTIFY_CLIENT_ID)

// Refresh access token if expired
export async function refreshAccessToken(tokens: SpotifyTokens): Promise<string> {
  const params = new URLSearchParams()
  params.append("grant_type", "refresh_token")
  params.append("refresh_token", tokens.refreshToken)
  params.append("client_id", SPOTIFY_CLIENT_ID)
  params.append("client_secret", SPOTIFY_CLIENT_SECRET)

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: params,
  })

  if (!res.ok) {
    throw new Error(`Failed to refresh Spotify token: ${res.statusText}`)
  }

  const data: SpotifyTokenResponse= await res.json() as SpotifyTokenResponse
  // data.access_token is the new token
  return data.access_token
}

// Add a song to the driver’s Spotify queue
export async function addSongToDriverQueue(
  trackUri: string,
  tokens: SpotifyTokens
) {
  // Ensure the access token is valid
  const accessToken = await refreshAccessToken(tokens)

  const res = await fetch(
    `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(trackUri)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.statusText}`)
  }
}

