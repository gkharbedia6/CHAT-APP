import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Image from "next/image";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchRedis } from "@/helpers/redis";
import { messageArrayValidator } from "@/lib/validations/message";
import ClientChat from "./components/ClientChat";
import { Message, User } from "@/types/db";

interface PageProps {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );

    const dbMessages = results.map((message) => JSON.parse(message) as Message);

    const reversedDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reversedDbMessages);

    return messages;
  } catch (error) {
    notFound();
  }
}

const page = async ({ params }: PageProps) => {
  const { chatId } = params;

  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const { user } = session;

  const [userIdOne, userIdTwo] = chatId.split("--");

  if (user.id !== userIdOne && user.id !== userIdTwo) notFound();

  const chatPartnerId = user.id === userIdOne ? userIdTwo : userIdOne;
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;
  const initialMessages = await getChatMessages(chatId);

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:item-center justify-between py-3 px-4 border-b border-black">
        <div className="relative flex items-center space-x-2">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`Profile picture of ${chatPartner.name}`}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center text-xl">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>
            {/* <span className="text-sm text-gray-600">{chatPartner.email}</span> */}
          </div>
        </div>
      </div>

      <ClientChat
        initialMessages={initialMessages}
        session={session}
        chatPartner={chatPartner}
        chatId={chatId}
      />
    </div>
  );
};

export default page;
