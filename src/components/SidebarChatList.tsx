'use client';

import { FC, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { chatHrefConstructor } from '@/lib/utils';

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.includes('chat')) {
      setUnseenMessages((prev) =>
        prev.filter((message) => !pathname.includes(message.senderId))
      );
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
        const unseenMessageCount = unseenMessages.filter((unseenMessage) => {
          return unseenMessage.senderId === friend.id;
        }).length;
        return (
          <li key={friend.id}>
            <a
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 gorup flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionId,
                friend.id
              )}`}
            >
              {friend.name}
              {unseenMessageCount > 0 ? (
                <div className="bg-indigo-600 font-medium text-sm w-4 h-4 rounded-full flex justify-center items-center ">
                  {unseenMessageCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
