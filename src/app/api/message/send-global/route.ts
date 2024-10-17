import { getServerSession } from "next-auth";
import { nanoid } from "nanoid";

import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Message, messageValidator } from "@/lib/validations/message";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const {
      text,
      timestamp,
      replyToUserId,
      replyToMessegeId,
    }: {
      text: string;
      timestamp: number;
      replyToUserId: string;
      replyToMessegeId: string;
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

    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
      replyToUserId,
      replyToMessegeId,
    };

    const message = messageValidator.parse(messageData);

    pusherServer.trigger(toPusherKey(`global-chat`), "messages", message),
      await db.zadd(`global-chat:messages`, {
        score: timestamp,
        member: JSON.stringify(message),
      });

    return new Response("Message sent", { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response("Internal server error", { status: 500 });
  }
}
