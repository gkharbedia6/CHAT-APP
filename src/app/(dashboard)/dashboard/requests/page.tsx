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
      const userData = JSON.parse(user) as User;
      return {
        senderId: incomingId,
        senderEmail: userData.email,
      };
    })
  );

  const outgoingRequestIds = (await fetchRedis(
    'smembers',
    `user:${session.user.id}:outgoing_friend_requests`
  )) as string[];

  const outgoingFriendRequests = await Promise.all(
    outgoingRequestIds.map(async (outgoingId) => {
      const user = (await fetchRedis('get', `user:${outgoingId}`)) as string;
      const userData = JSON.parse(user) as User;
      return {
        receiverId: outgoingId,
        receiverEmail: userData.email,
      };
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
