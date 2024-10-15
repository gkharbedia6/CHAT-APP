"use client";

import { FC, useEffect, useRef, useState } from "react";
import { format, set } from "date-fns";
import Image from "next/image";
import { Session } from "next-auth";
import { Reply, SmileIcon } from "lucide-react";

import { Message } from "@/lib/validations/message";
import { cn, toPusherKey } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";
import { ReplyTo } from "./ClientChatGlobal";

interface MessagesGlobalProps {
  globalChatUsers: User[];
  messages: Message[];
  session: Session;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsReplying: React.Dispatch<React.SetStateAction<boolean>>;
  setReplyTo: React.Dispatch<React.SetStateAction<ReplyTo | null>>;
}

const MessagesGlobal: FC<MessagesGlobalProps> = ({
  globalChatUsers,
  messages,
  session,
  setMessages,
  setIsReplying,
  setReplyTo,
}) => {
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  const [messegeSettingsOpen, setMessegeSettingsOpen] = useState<string | null>(
    null
  );
  console.log(messages);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`global-chat`));

    const newMessageHandler = (message: Message) => {
      setMessages((prev) => {
        const optimisticMessageIndex = prev.findIndex(
          (msg) =>
            msg.id.startsWith("temp") && // Look for optimistic messages
            msg.text === message.text && // Same content
            msg.senderId === message.senderId // Same sender
        );

        if (optimisticMessageIndex > -1) {
          // Replace optimistic message with the real message
          const newMessages = [...prev];
          newMessages[optimisticMessageIndex] = message;
          return newMessages;
        }

        return [message, ...prev]; // Add the message normally if it's not a replacement
      });
    };

    pusherClient.bind("messages", newMessageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`global-chat`));
      pusherClient.unbind("messages", newMessageHandler);
    };
  }, []);

  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse py-6 px-3 gap-[2px] overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch overflow-hidden"
    >
      <div ref={scrollDownRef} />
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === session.user.id;

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        const hasPreviousMessageFromSameUser =
          messages[index + 1]?.senderId === messages[index].senderId;

        return (
          <div
            className="chat-message"
            key={`${message.id}-${message.timestamp}`}
          >
            <p
              className={cn("text-xs  ml-12 mt-3 text-gray-600 py-2", {
                hidden:
                  hasPreviousMessageFromSameUser ||
                  isCurrentUser ||
                  message.replyToUserId !== "",
              })}
            >
              {
                globalChatUsers
                  .find((user) => user.id === message.senderId)
                  ?.name.split(" ")[0]
              }
            </p>
            <div
              onMouseEnter={() => setMessegeSettingsOpen(message.id)}
              onMouseLeave={() => setMessegeSettingsOpen(null)}
              className={cn("flex items-end relative", {
                "justify-end": isCurrentUser,
              })}
            >
              <div className={cn("flex flex-col order-2")}>
                {message.replyToUserId !== "" ? (
                  <div className={cn("py-2 mx-2 flex flex-col gap-1")}>
                    <div
                      className={cn(
                        "flex w-full flex-row px-2 text-xs text-gray-600",
                        {
                          "justify-start": !isCurrentUser,
                          "justify-end": isCurrentUser,
                        }
                      )}
                    >
                      {isCurrentUser
                        ? "You"
                        : globalChatUsers.find(
                            (user) => user.id === message.senderId
                          )?.name}{" "}
                      replied to{" "}
                      {message.replyToUserId === session.user.id &&
                      message.senderId === session.user.id
                        ? "yourself"
                        : message.replyToUserId === session.user.id &&
                          message.senderId !== session.user.id
                        ? "you"
                        : message.replyToUserId === message.senderId
                        ? "self"
                        : globalChatUsers.find(
                            (user) => user.id === message.replyToUserId
                          )?.name}
                    </div>

                    <div
                      className={cn(
                        "flex w-full flex-row px-2  text-xs text-gray-400",
                        {
                          "justify-start border-l-[4px] border-gray-200":
                            !isCurrentUser,
                          "justify-end border-r-[4px] border-gray-200":
                            isCurrentUser,
                        }
                      )}
                    >
                      <span
                        className={cn(
                          "px-4 py-2 rounded-[24px] inline-block max-w-full break-words bg-gray-200 text-gray-900" // Add break-words
                        )}
                      >
                        {
                          messages.find(
                            (msg) => msg.id === message.replyToMessegeId
                          )?.text
                        }
                      </span>
                    </div>
                  </div>
                ) : null}
                <div
                  className={cn("flex text-base max-w-xs mx-2", {
                    "order-1 items-center gap-3 flex-row-reverse ":
                      isCurrentUser,
                    "order-2 items-center gap-3 flex-row": !isCurrentUser,
                  })}
                >
                  <span
                    className={cn(
                      "px-4 py-2 rounded-[24px] inline-block max-w-full break-words", // Add break-words
                      {
                        "bg-indigo-600 text-white": isCurrentUser,
                        "bg-gray-200 text-gray-900": !isCurrentUser,
                        "rounded-tl-none rounded-bl-none":
                          hasNextMessageFromSameUser &&
                          hasPreviousMessageFromSameUser &&
                          !isCurrentUser,
                        "rounded-tl-none":
                          !hasNextMessageFromSameUser && !isCurrentUser,
                        "rounded-bl-none":
                          !hasPreviousMessageFromSameUser && !isCurrentUser,
                        "rounded-tr-none rounded-br-none":
                          hasNextMessageFromSameUser &&
                          hasPreviousMessageFromSameUser &&
                          isCurrentUser,
                        "rounded-tr-none":
                          !hasNextMessageFromSameUser && isCurrentUser,
                        "rounded-br-none":
                          !hasPreviousMessageFromSameUser && isCurrentUser,
                      }
                    )}
                  >
                    {message.text}
                  </span>
                  {messegeSettingsOpen === message.id && (
                    <div
                      className={cn("flex items-center", {
                        "left-[90px] flex-row justify-start":
                          message.senderId !== session.user.id,
                        "right-[90px] flex-row-reverse justify-end":
                          message.senderId === session.user.id,
                      })}
                    >
                      <div
                        className={cn(
                          "p-2 cursor-pointer hover:bg-gray-100 rounded-full text-rich_gray-900    hover:text-indigo-600"
                        )}
                      >
                        <SmileIcon className="w-5 h-5" />
                      </div>
                      <div
                        onClick={() => {
                          setIsReplying(true);
                          setReplyTo({
                            text: message.text,
                            replyToUserId: message.senderId,
                            replyToMessegeId: message.id,
                          });
                        }}
                        className={cn(
                          "p-2 cursor-pointer hover:bg-gray-100 rounded-full text-rich_gray-900    hover:text-indigo-600"
                        )}
                      >
                        <Reply className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {!isCurrentUser ? (
                <div
                  className={cn("relative w-6 h-6", {
                    "order-2": isCurrentUser,
                    "order-1": !isCurrentUser,
                    invisible: hasNextMessageFromSameUser,
                  })}
                >
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    src={
                      globalChatUsers.find(
                        (user) => user.id === message.senderId
                      )?.image as string
                    }
                    alt={`Profile picture of ${
                      isCurrentUser
                        ? session.user.name
                        : globalChatUsers.find(
                            (user) => user.id === message.senderId
                          )?.name
                    }`}
                  />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesGlobal;
