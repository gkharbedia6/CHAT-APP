"use client";

import { FC, useEffect, useRef, useState } from "react";
import { format, set } from "date-fns";
import Image from "next/image";
import { Session } from "next-auth";

import { Message } from "@/lib/validations/message";
import { cn, toPusherKey } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";

interface MessagesGlobalProps {
  globalChatUsers: User[];
  messages: Message[];
  session: Session;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const MessagesGlobal: FC<MessagesGlobalProps> = ({
  globalChatUsers,
  messages,
  session,
  setMessages,
}) => {
  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatTimestamp = (timestamp: number) => {
    const now = new Date().getTime();
    const timeDiff = now - timestamp;
    const tenMinutes = 10 * 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    if (timeDiff < tenMinutes) return; // Do not show timestamp if it's within 10 minutes
    if (timeDiff < oneDay) return format(timestamp, "HH:mm"); // Show time if within the day
    if (timeDiff < oneWeek) return format(timestamp, "EEEE"); // Show day of the week if within the current week
    return format(timestamp, "dd/MM/yyyy"); // Show date otherwise
  };
  const shouldShowTimestamp = (
    currentMessage: Message,
    previousMessage?: Message
  ) => {
    if (!previousMessage) return true; // Show timestamp for the first message
    const timeDiff = previousMessage.timestamp - currentMessage.timestamp;
    // console.log(previousMessage.timestamp - currentMessage.timestamp);
    return timeDiff > 10 * 60 * 1000; // Show timestamp if more than 10 minutes have passed
  };

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
      className="flex h-full flex-1 flex-col-reverse py-6 px-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch overflow-hidden"
    >
      <div ref={scrollDownRef} />
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === session.user.id;

        const previousMessage = messages[index - 1];

        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        const hasPreviousMessageFromSameUser =
          messages[index + 1]?.senderId === messages[index].senderId;

        return (
          <div
            className="chat-message"
            key={`${message.id}-${message.timestamp}`}
          >
            {shouldShowTimestamp(message, previousMessage) && (
              <p className="text-center text-xs text-gray-400 py-5 px-4">
                {formatTimestamp(message.timestamp)}
              </p>
            )}

            <div
              className={cn("flex items-end", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-[2px] text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <p
                  className={cn(
                    "text-xs ml-2 mt-3 text-gray-400 inline-block py-2",
                    {
                      hidden: hasPreviousMessageFromSameUser || isCurrentUser,
                    }
                  )}
                >
                  {
                    globalChatUsers
                      .find((user) => user.id === message.senderId)
                      ?.name.split(" ")[0]
                  }
                </p>
                <span
                  className={cn(
                    "px-4 py-2 rounded-full inline-block max-w-full break-words", // Add break-words
                    {
                      "bg-indigo-600 text-white": isCurrentUser,
                      "bg-gray-200 text-gray-900": !isCurrentUser,
                      "rounded-tr-md":
                        !hasNextMessageFromSameUser && isCurrentUser,
                      "rounded-br-md":
                        !hasPreviousMessageFromSameUser && isCurrentUser,
                      "rounded-tr-md rounded-br-md":
                        hasPreviousMessageFromSameUser &&
                        hasNextMessageFromSameUser &&
                        isCurrentUser,
                      "rounded-tl-md":
                        !hasNextMessageFromSameUser && !isCurrentUser,
                      "rounded-bl-md":
                        !hasPreviousMessageFromSameUser && !isCurrentUser,
                      "rounded-tl-md rounded-bl-md":
                        hasPreviousMessageFromSameUser &&
                        hasNextMessageFromSameUser &&
                        !isCurrentUser,
                      "rounded-full":
                        (!hasPreviousMessageFromSameUser &&
                          !hasNextMessageFromSameUser &&
                          isCurrentUser) ||
                        (!hasPreviousMessageFromSameUser &&
                          !hasNextMessageFromSameUser &&
                          !isCurrentUser),
                    }
                  )}
                >
                  {message.text}
                </span>
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
