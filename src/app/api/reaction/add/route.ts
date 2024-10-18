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
      messageText,
    }: {
      emoji: EmojiClickData;
      messageId: string;
      timestamp: number;
      messageText: string;
    } = await req.json();

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
    const reactionData: Reaction = {
      messageId: messageId,
      emoji: emoji,
      senderId: sender.id,
      timestamp: timestamp,
      messageText: messageText,
    };
    const reactionsValid = reactionValidator.parse(reactionData);

    if (
      Array.isArray(initilalReactions) &&
      Array.isArray(initilalReactions[0])
    ) {
      const reactions = initilalReactions[0] as Reaction[];

      const alreadyReactedToMessage = reactions.find((reaction) => {
        return (
          reaction.messageId === messageId && reaction.senderId === sender.id
        );
      });

      let nextPosition;
      if (alreadyReactedToMessage) {
        const index = reactions.indexOf(alreadyReactedToMessage);
        pusherServer.trigger(
          toPusherKey(`messageId:${messageId}`),
          "reactions",
          reactionData
        ),
          await db.json.del("reactions", `$.[${index}]`);
        nextPosition = index;
      } else {
        nextPosition = reactions.length;
      }

      pusherServer.trigger(
        toPusherKey(`messageId:${messageId}`),
        "reactions",
        reactionData
      ),
        await db.json.arrinsert("reactions", "$", nextPosition, reactionsValid);
      return new Response("Reaction sent", { status: 200 });
    }
    pusherServer.trigger(
      toPusherKey(`messageId:${messageId}`),
      "reactions",
      reactionsValid
    ),
      await db.json.set("reactions", "$", [reactionsValid]);
    return new Response("Reaction sent", { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response("Internal server error", { status: 500 });
  }
}
