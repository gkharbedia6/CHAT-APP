'use client';

import axios from 'axios';
import { Check, UserPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';

import Button from '@/ui/Button';

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

  const acceptFriend = async (senderId: string) => {
    await axios.post('/api/friends/accept', { id: senderId });
    setIncomingRequests((prev) =>
      prev.filter((friendRequest) => friendRequest.senderId !== senderId)
    );
    router.refresh();
  };

  const denyFriend = async (senderId: string) => {
    await axios.post('/api/friends/deny', { id: senderId });
    setIncomingRequests((prev) =>
      prev.filter((friendRequest) => friendRequest.senderId !== senderId)
    );
    router.refresh();
  };

  const cancelRequest = async (receiverId: string) => {
    await axios.post('/api/friends/cancel', { id: receiverId });
    setOutgoingRequests((prev) =>
      prev.filter((friendRequest) => friendRequest.receiverId !== receiverId)
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
          incomingRequests.map((incomingRequests) => (
            <div
              key={incomingRequests.senderId}
              className="flex gap-4 items-center py-1 justify-between"
            >
              <UserPlus className="text-black" />
              <p className="font-medium text-lg">
                {incomingRequests.senderEmail}
              </p>
              <button
                aria-label="accept friend"
                className="w-8 h-8 bg-indigo-600 hover:bg-indigo-600 grid place-items-center rounded-full transition hover:shadow-md"
              >
                <Check
                  className="font-semibold text-white w-3/4 h-3/4"
                  onClick={() => acceptFriend(incomingRequests.senderId)}
                />
              </button>
              <button
                aria-label="deny friend"
                className="w-8 h-8 bg-red-600 hover:bg-red-600 grid place-items-center rounded-full transition hover:shadow-md"
              >
                <X
                  className="font-semibold text-white w-3/4 h-3/4"
                  onClick={() => denyFriend(incomingRequests.senderId)}
                />
              </button>
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
          outgoingRequests.map((outgoingRequests) => (
            <div
              key={outgoingRequests.receiverId}
              className="flex gap-4 items-center justify-between py-1"
            >
              <UserPlus className="text-black " />
              <p className="font-medium text-lg">
                {outgoingRequests.receiverEmail}
              </p>
              <Button
                variant={'default'}
                size={'sm'}
                className="bg-indigo-500 w-fit hover:bg-indigo-600 transition hover:shadow-md"
                onClick={() => cancelRequest(outgoingRequests.receiverId)}
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
