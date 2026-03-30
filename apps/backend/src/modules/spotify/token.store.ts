import { SpotifyTokens } from "@riderdj/types";

let tokens: SpotifyTokens | null = null;

export function setTokens(data: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: Date.now() + data.expires_in * 1000,
  };
}

export function getTokens() {
  return tokens;
}