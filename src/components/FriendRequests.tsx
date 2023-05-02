'use client';

import axios from 'axios';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import Image from 'next/image';

import Button from '@/ui/Button';
import { pusherClient } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  outgoingFriendRequests: OutgoingFriendRequest[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  outgoingFriendRequests,
  sessionId,
}) => {
  const [incomingRequests, setIncomingRequests] = useState<
    IncomingFriendRequest[]
  >(incomingFriendRequests);
  const [outgoingRequests, setOutgoingRequests] = useState<
    OutgoingFriendRequest[]
  >(outgoingFriendRequests);

  const router = useRouter();

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = (user: IncomingFriendRequest) => {
      setIncomingRequests((prev) => [...prev, user]);
    };

    pusherClient.bind('incoming_friend_requests', friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler);
    };
  }, []);

  const acceptFriend = async (senderId: string) => {
    await axios.post('/api/friends/accept', { id: senderId });
    setIncomingRequests((prev) =>
      prev.filter((friendRequest) => friendRequest.id !== senderId)
    );
    router.refresh();
  };

  const denyFriend = async (senderId: string) => {
    await axios.post('/api/friends/deny', { id: senderId });
    setIncomingRequests((prev) =>
      prev.filter((friendRequest) => friendRequest.id !== senderId)
    );
    router.refresh();
  };

  const cancelRequest = async (receiverId: string) => {
    await axios.post('/api/friends/cancel', { id: receiverId });
    setOutgoingRequests((prev) =>
      prev.filter((friendRequest) => friendRequest.id !== receiverId)
    );
    router.refresh();
  };

  return (
    <main className="flex flex-row justify-evenly">
      <div className="p-3">
        <h1 className="text-3xl font-semibold py-2 mb-3 ">
          Incoming friend requests
        </h1>
        {incomingRequests.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing to show here...</p>
        ) : (
          incomingRequests.map((incomingRequest) => (
            <div
              key={incomingRequest.id}
              className="flex gap-4 items-center py-1 justify-between"
            >
              <div className="relative h-8 w-8 bg-gray-50">
                <Image
                  fill
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                  src={incomingRequest.image ?? ''}
                  alt={`Profile picture of ${incomingRequest.name}`}
                />
              </div>
              <p className="font-medium text-lg">{incomingRequest.name}</p>
              <div className="flex flex-row gap-3">
                <button
                  aria-label="accept friend"
                  className="w-8 h-8 bg-indigo-600 hover:bg-indigo-600 grid place-items-center rounded-full transition hover:shadow-md"
                >
                  <Check
                    className="font-semibold text-white w-3/4 h-3/4"
                    onClick={() => acceptFriend(incomingRequest.id)}
                  />
                </button>
                <button
                  aria-label="deny friend"
                  className="w-8 h-8 bg-red-600 hover:bg-red-600 grid place-items-center rounded-full transition hover:shadow-md"
                >
                  <X
                    className="font-semibold text-white w-3/4 h-3/4"
                    onClick={() => denyFriend(incomingRequest.id)}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 ">
        <h1 className="text-3xl font-semibold py-2 mb-3">
          Outgoing friend requests
        </h1>
        {outgoingRequests.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing to show here...</p>
        ) : (
          outgoingRequests.map((outgoingRequest) => (
            <div
              key={outgoingRequest.id}
              className="flex gap-4 items-center justify-between py-1"
            >
              <div className="relative h-8 w-8 bg-gray-50">
                <Image
                  fill
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                  src={outgoingRequest.image ?? ''}
                  alt={`Profile picture of ${outgoingRequest.name}`}
                />
              </div>
              <p className="font-medium text-lg">{outgoingRequest.name}</p>
              <Button
                variant={'default'}
                size={'sm'}
                className="bg-indigo-500 w-fit hover:bg-indigo-600 transition hover:shadow-md "
                onClick={() => cancelRequest(outgoingRequest.id)}
              >
                Cancel
              </Button>
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default FriendRequests;
