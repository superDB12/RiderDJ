import { FastifyInstance } from "fastify";
import { setTokens } from "./token.store";
import { addToSpotifyQueue, getValidAccessToken } from "./spotify.service";
import { prisma } from "../../infrastructure/database/prisma";

const clientId = process.env.SPOTIFY_CLIENT_ID as string;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET as string;

export async function spotifyRoutes(app: FastifyInstance) {
  console.log("✅ Spotify routes registered");

  app.get("/spotify/login", async (request, reply) => {
    const { rideId, redirectTo } = request.query as { rideId?: string; redirectTo?: string };

    const state = Buffer.from(JSON.stringify({ rideId, redirectTo })).toString("base64");

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      //redirect_uri: "https://driver-handler-shading.ngrok-free.dev/spotify/callback",
      redirect_uri: "http://127.0.0.1:3000/spotify/callback",
      scope: "user-modify-playback-state user-read-playback-state",
      state,
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    console.log("Redirect URI:", params.get("redirect_uri"));

    return reply.redirect(authUrl);
  });

  app.get("/spotify/callback", async (request, reply) => {
    const { code, state } = request.query as { code: string; state: string };

    console.log("SPOTIFY CODE:", code);

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://127.0.0.1:3000/spotify/callback",
      }),
    });

    const data = await res.json();
    setTokens(data);
    console.log("TOKENS RECEIVED:", data);

    const { rideId, redirectTo } = JSON.parse(
      Buffer.from(state, "base64").toString()
    );

    await prisma.ride.upsert({
      where: { id: rideId },
      update: { isActive: true },
      create: { id: rideId, isActive: true },
    });

    console.log("Redirecting to:", redirectTo ?? `riderdj://driver/${rideId}`);
    return reply.redirect(redirectTo ?? `riderdj://driver/${rideId}`);
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

