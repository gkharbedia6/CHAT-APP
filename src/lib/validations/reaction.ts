import { z } from "zod";

export const reactionValidator = z.object({
  emoji: z.any(),
  senderId: z.string(),
  timestamp: z.number(),
});

export type Reaction = z.infer<typeof reactionValidator>;
