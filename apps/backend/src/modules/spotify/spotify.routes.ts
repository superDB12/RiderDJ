import { FastifyInstance } from "fastify";
import * as dotenv from "dotenv";
import { getTokens, setTokens } from "./token.store";
import { addToSpotifyQueue, getValidAccessToken } from "./spotify.service";
import 'dotenv/config';
//dotenv.config();

const clientId = process.env.SPOTIFY_CLIENT_ID as string;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET as string;

/*const params = new URLSearchParams({
  client_id: clientId,
  response_type: "code",
  redirect_uri: "http://192.168.86.130:3000/spotify/callback",
  scope: "user-modify-playback-state user-read-playback-state",
});
*/
//const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

export async function spotifyRoutes(app: FastifyInstance) {
  app.get("/spotify/login", async (request, reply) => {
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: "http://127.0.0.1:3000/spotify/callback",
      //redirect_uri: "http://192.168.86.130:3000/spotify/callback",
      scope: "user-modify-playback-state user-read-playback-state",
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    
    //console.log(reply);

    return reply.redirect(authUrl);
  });

  app.get("/spotify/callback", async (request, reply) => {
    const { code } = request.query as { code: string };

    console.log("SPOTIFY CODE:", code);

    // 🔥 THIS is your token exchange code
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://127.0.0.1:3000/spotify/callback",
      }),
    });

    const data = await res.json();

  // 🔥 store tokens
  setTokens(data);

  return { success: true };
  });

  app.get("/spotify/search", async (request, reply) => {
  const { q } = request.query as { q: string };

  if (!q) {
    return reply.status(400).send({ error: "Missing query" });
  }

  const accessToken = await getValidAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();

  // 🔥 simplify response for frontend
  const tracks = data.tracks.items.map((track: any) => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(", "),
  }));

  return { tracks };

});

app.post("/spotify/queue", async (request, reply) => {
  const { trackId } = request.body as { trackId: string };

  await addToSpotifyQueue(trackId);

  return { success: true };
});

}

