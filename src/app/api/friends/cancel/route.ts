import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id: idToCancel } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    await db.srem(
      `user:${session.user.id}:outgoing_friend_requests`,
      idToCancel
    );
    await db.srem(
      `user:${idToCancel}:incoming_friend_requests`,
      session.user.id
    );

    return new Response('Friend request canceled', { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 });
    }
    return new Response('Invalid request', { status: 400 });
  }
}
