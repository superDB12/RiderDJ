import { z } from "zod";

export const CreateRideSchema = z.object({
  maxQueueSize: z.number().min(1).max(20),
  explicitFilter: z.boolean()
});