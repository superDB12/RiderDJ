import { FastifyRequest, FastifyReply } from "fastify";
import { registerDriver, loginDriver } from "./auth.service";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as { email: string; password: string };

  if (!email || !password) {
    return reply.status(400).send({ error: "Email and password are required" });
  }

  try {
    const { id: driverId } = await registerDriver(email, password);
    const token = await reply.jwtSign({ driverId });
    return reply.status(201).send({ token, driverId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return reply.status(400).send({ error: message });
  }
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as { email: string; password: string };

  if (!email || !password) {
    return reply.status(400).send({ error: "Email and password are required" });
  }

  try {
    const { id: driverId } = await loginDriver(email, password);
    const token = await reply.jwtSign({ driverId });
    return reply.status(200).send({ token, driverId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    return reply.status(401).send({ error: message });
  }
}
