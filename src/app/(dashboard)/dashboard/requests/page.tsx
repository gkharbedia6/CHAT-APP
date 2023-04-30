import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helpers/redis';
import FriendRequests from '@/components/FriendRequests';

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const incomingRequestIds = (await fetchRedis(
    'smembers',
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendRequests = await Promise.all(
    incomingRequestIds.map(async (incomingId) => {
      const user = (await fetchRedis('get', `user:${incomingId}`)) as string;
      return JSON.parse(user) as User;
    })
  );

  const outgoingRequestIds = (await fetchRedis(
    'smembers',
    `user:${session.user.id}:outgoing_friend_requests`
  )) as string[];

  const outgoingFriendRequests = await Promise.all(
    outgoingRequestIds.map(async (outgoingId) => {
      const userData = (await fetchRedis(
        'get',
        `user:${outgoingId}`
      )) as string;
      return JSON.parse(userData) as User;
    })
  );

  return (
    <main>
      <h1 className="text-4xl font-bold text-center mb-3">
        Manage friend requests
      </h1>
      <FriendRequests
        incomingFriendRequests={incomingFriendRequests}
        outgoingFriendRequests={outgoingFriendRequests}
        sessionId={session.user.id}
      />
    </main>
  );
};

export default page;
