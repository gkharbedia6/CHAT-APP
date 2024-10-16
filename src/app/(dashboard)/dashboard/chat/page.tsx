import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Image from "next/image";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchRedis } from "@/helpers/redis";
import { messageArrayValidator } from "@/lib/validations/message";
import ClientChatGlobal from "./components/ClientChatGlobal";
import { User, Message } from "@/types/db";
import { reactionsArrayValidator } from "@/lib/validations/reaction";

interface PageProps {}

async function getChatMessages() {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `global-chat:messages`,
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

async function getMessagesReactions() {
  try {
    const results: string = await fetchRedis("json.get", "reactions", "$");

    if (!results) return;

    const dbReactions = JSON.parse(results)[0];

    const reactions = reactionsArrayValidator.parse(dbReactions);

    return reactions;
  } catch (error) {
    console.log(error);
    notFound();
  }
}

const page = async ({}: PageProps) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const { user } = session;

  if (!user.id) notFound();

  const initialMessages = await getChatMessages();

  const initialReactions = await getMessagesReactions();

  const globalChatUserIds = [
    ...new Set(initialMessages.map((message) => message.senderId)),
  ];
  const globalChatUsers = [
    ...new Set(
      await Promise.all(
        globalChatUserIds.map(async (id) => {
          return (await db.get(`user:${id}`)) as User;
        })
      )
    ),
  ];

  return (
    <div className="flex-1 justify-between flex flex-col h-full ">
      <div className="flex sm:item-center justify-between py-3 px-4 border-b border-black">
        <div className="relative flex items-center space-x-2">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              {/* <Image
                fill
                referrerPolicy="no-referrer"
                src={chatPartner.image}
                alt={`Profile picture of ${chatPartner.name}`}
                className="rounded-full"
              /> */}
              <div className="w-12 aspect-square rounded-full bg-black"></div>
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center text-xl">
              <span className="text-gray-700 mr-3 font-semibold">
                Global chat
              </span>
            </div>
          </div>
        </div>
      </div>

      <ClientChatGlobal
        initialReactions={initialReactions}
        globalChatUsers={globalChatUsers}
        initialMessages={initialMessages}
        session={session}
      />
    </div>
  );
};

export default page;
