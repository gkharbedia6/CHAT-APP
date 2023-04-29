import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id: idToAccept } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const isAlreadyFriend = await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAccept
    );
    if (isAlreadyFriend) {
      return new Response('Already friends', { status: 400 });
    }

    const isIncomingFriendRequest = await fetchRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      idToAccept
    );
    if (!isIncomingFriendRequest) {
      return new Response('No incoming friend request', { status: 400 });
    }

    await db.sadd(`user:${session.user.id}:friends`, idToAccept);
    await db.sadd(`user:${idToAccept}:friends`, session.user.id);
    await db.srem(
      `user:${session.user.id}:incoming_friend_requests`,
      idToAccept
    );
    await db.srem(
      `user:${idToAccept}:outgoing_friend_requests`,
      session.user.id
    );

    return new Response('Friend added', { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 });
    }
    return new Response('Invalid request', { status: 400 });
  }
}
