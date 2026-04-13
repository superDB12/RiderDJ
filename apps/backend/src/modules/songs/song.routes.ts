import { FastifyInstance } from "fastify"
import { addSong, getRideQueue, removeSong } from "./song.controller"

export async function songsRoutes(app: FastifyInstance) {

  app.post("/rides/:rideId/songs", addSong)

  app.get("/rides/:rideId/queue", getRideQueue)

  app.delete("/songs/:songId", removeSong);

}