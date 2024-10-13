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
    const { text }: { text: string } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // if (session.user.id !== userIdOne && session.user.id !== userIdTwo) {
    //   return new Response("Unauthorized", { status: 401 });
    // }

    // const friendId = session.user.id === userIdOne ? userIdTwo : userIdOne;

    // const friendListData = (await fetchRedis(
    //   "smembers",
    //   `user:${session.user.id}:friends`
    // )) as string[];

    // const isFriend = friendListData.includes(friendId);

    // if (!isFriend) {
    //   return new Response("Unauthorized", { status: 401 });
    // }

    const senderData = (await fetchRedis(
      "get",
      `user:${session.user.id}`
    )) as string;
    const sender = JSON.parse(senderData);

    const timestamp = Date.now();

    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
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
