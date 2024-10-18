import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { Icon, Icons } from "@/components/Icons";
import SignOutButton from "@/components/SignOutButton";
import FriendRequestsSidebarOption from "@/components/FriendRequestsSidebarOption";
import { fetchRedis } from "@/helpers/redis";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import SidebarChatList from "@/components/SidebarChatList";
import SettingsModal from "@/components/SettingsModal";
import { User } from "@/types/db";
import ReactionModal from "@/components/ReactionModal";

interface LayoutProps {
  children: ReactNode;
}

interface SidebarOption {
  id: number;
  name: string;
  href: string;
  Icon: Icon;
}

const sidebarOption: SidebarOption[] = [
  {
    id: 1,
    name: "Add friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

const layout = async ({ children }: LayoutProps) => {
  const session = await getServerSession(authOptions);
  if (!session) return notFound();

  const friends = await getFriendsByUserId(session.user.id);

  const unseenRequestCount = (
    (await fetchRedis(
      "smembers",
      `user:${session.user.id}:incoming_friend_requests`
    )) as User[]
  ).length;

  return (
    <div className="w-full flex h-screen relative items-center justify-center ">
      <SettingsModal />
      <ReactionModal />
      <div className="w-[95%] h-[95%]  flex border border-black shadow-md">
        <div className="flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto overflow-x-hidden border-r border-black  p-6">
          <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
            <Icons.Logo className="h-8 w-auto text-rich_gray-900" />
          </Link>
          {friends.length > 0 ? (
            <div className="t-xs font-semibold leading-6 text-gray-400">
              Your chats
            </div>
          ) : null}
          <a
            className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 gorup flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            href={`/dashboard/chat`}
          >
            Global chat
            {/* {unseenMessageCount > 0 ? (
                <div className="bg-indigo-600 font-medium text-sm w-4 h-4 rounded-full flex justify-center items-center ">
                  {unseenMessageCount}
                </div>
              ) : null} */}
          </a>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <SidebarChatList
                  friends={friends}
                  sessionId={session.user.id}
                />
              </li>
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">
                  Overview
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {sidebarOption.map((option) => {
                    const Icon = Icons[option.Icon];
                    return (
                      <li key={option.id}>
                        <Link
                          href={option.href}
                          className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        >
                          <span className="text-rich_gray-900 border-rich_gray-900 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium ">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate">{option.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <FriendRequestsSidebarOption
                      sessionId={session.user.id}
                      initialUnseenRequestCount={unseenRequestCount}
                    />
                  </li>
                </ul>
              </li>

              <li className="-mx-6 mt-auto flex items-center ">
                <div className="flex flex-1 items-center gap-x-4 py-3 px-6 text-sm font-semibold leading-6 text-gray-900">
                  <div className="relative h-8 w-8 bg-gray-50">
                    <Image
                      fill
                      referrerPolicy="no-referrer"
                      className="rounded-full"
                      src={session.user.image || ""}
                      alt="Your profile picture"
                    />
                  </div>
                  <span className="sr-only">Your profile</span>
                  <div className="flex flex-col">
                    <span aria-hidden="true">{session.user.name}</span>
                    <span className="text-xs text-gray-400" aria-hidden="true">
                      {session.user.email}
                    </span>
                  </div>
                </div>
                <SignOutButton className="h-[75%] aspect-square relative right-1 " />
              </li>
            </ul>
          </nav>
        </div>

        <aside className="max-h-screen container w-full">{children}</aside>
      </div>
    </div>
  );
};

export default layout;
