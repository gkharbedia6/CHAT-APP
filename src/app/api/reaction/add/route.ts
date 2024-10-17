import { getServerSession } from "next-auth";
import { EmojiClickData } from "emoji-picker-react";

import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { Reaction, reactionValidator } from "@/lib/validations/reaction";

export async function POST(req: Request) {
  try {
    const {
      emoji,
      messageId,
      timestamp,
    }: { emoji: EmojiClickData; messageId: string; timestamp: number } =
      await req.json();

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const senderData = (await fetchRedis(
      "get",
      `user:${session.user.id}`
    )) as string;
    const sender = JSON.parse(senderData);

    const initilalReactions = await db.json.get("reactions", "$");
    const reactionData = {
      messageId: messageId,
      emoji: emoji,
      senderId: sender.id,
      timestamp: timestamp,
    };

    if (
      Array.isArray(initilalReactions) &&
      Array.isArray(initilalReactions[0])
    ) {
      const nextPosition = initilalReactions[0].length;

      // const reactions = reactionValidator.parse(reactionData);

      pusherServer.trigger(
        toPusherKey(`messageId:${messageId}`),
        "reactions",
        reactionData
      ),
        await db.json.arrinsert("reactions", "$", nextPosition, reactionData);
      return new Response("Message sent", { status: 200 });
    } else {
      pusherServer.trigger(
        toPusherKey(`messageId:${messageId}`),
        "reactions",
        reactionData
      ),
        await db.json.set("reactions", "$", [reactionData]);
      console.log("No valid array found in the response.");
      return;
    }
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response("Internal server error", { status: 500 });
  }
}
