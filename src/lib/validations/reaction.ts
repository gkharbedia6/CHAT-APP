import { z } from "zod";

export const reactionValidator = z.object({
  messageId: z.string(),
  emoji: z.any(),
  senderId: z.string(),
  timestamp: z.number(),
  messageText: z.string(),
});

export const reactionsArrayValidator = z.array(reactionValidator);

export type Reaction = z.infer<typeof reactionValidator>;
