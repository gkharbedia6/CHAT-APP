"use client";

import { FC, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Session } from "next-auth";
import { Reply, SmileIcon, MoreVerticalIcon } from "lucide-react";

import { Message } from "@/lib/validations/message";
import { cn, toPusherKey } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";
import { ReplyTo } from "./ClientChatGlobal";
import Tooltip from "@/components/ui/Tooltip";
import EmojiPicker from "emoji-picker-react";
import { useSettingsModalContext } from "@/contexts/SettingsModalContext";
import MoreSettings from "@/components/MoreSettings";

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
  const messageRefs = useRef({} as any);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerIconRef = useRef<HTMLDivElement | null>(null);
  const moreSettingsRef = useRef<HTMLDivElement | null>(null);
  const moreSettingsIconRef = useRef<HTMLDivElement | null>(null);

  const { isSettingsModalOpen, setIsSettingsModalOpen } =
    useSettingsModalContext();
  const [messageSettingsHovered, setMessageSettingsHovered] = useState<
    string | null
  >(null);
  const [messageSettingsOpened, setMessageSettingsOpened] = useState<
    string | null
  >(null);
  const [moreSettingsOpen, setMoreSettingsOpen] = useState<string | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<string | null>(
    null
  );

  const [emojiIconPosition, setEmojiIconPosition] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });
  const [moreSettingIconPosition, setMoreSettingIconPosition] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });

  const scrollToMessage = (messageId: string | undefined) => {
    if (!messageId) return;
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Function to get the emojiIconPosition of the element
  const updateEmojiIconPosition = () => {
    if (emojiPickerIconRef.current) {
      const rect = emojiPickerIconRef.current.getBoundingClientRect();
      setEmojiIconPosition({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
      });
    }
  };
  const updateMoreSettingsIconPosition = () => {
    if (moreSettingsIconRef.current) {
      const rect = moreSettingsIconRef.current.getBoundingClientRect();
      setMoreSettingIconPosition({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
      });
    }
  };

  const handleMouseEnter = (messageId: string) => {
    setMessageSettingsHovered(messageId);
    // if (!isEmojiPickerOpen && !moreSettingsOpen) {
    // }
  };

  const handleMouseLeave = () => {
    setMessageSettingsHovered(null); // Reset hovered state
    if (!isEmojiPickerOpen && !moreSettingsOpen) {
    }
  };

  const handleEmojiPickerClick = (messageId: string) => {
    setMoreSettingsOpen(null);

    if (isEmojiPickerOpen === messageId) {
      setIsEmojiPickerOpen(null);
      setMessageSettingsOpened(null);
    } else {
      setIsEmojiPickerOpen(messageId);
      setMessageSettingsOpened(messageId); // Set opened message settings
      // setMessageSettingsHovered(null); // Clear hovered state
    }
  };

  const handleMoreSettingsClick = (messageId: string) => {
    setIsEmojiPickerOpen(null);

    if (moreSettingsOpen === messageId) {
      setMoreSettingsOpen(null);
      setMessageSettingsOpened(null);
    } else {
      setMoreSettingsOpen(messageId);
      setMessageSettingsOpened(messageId); // Set opened message settings
      // setMessageSettingsHovered(null); // Clear hovered state
    }
  };

  useEffect(() => {
    updateEmojiIconPosition();
    updateMoreSettingsIconPosition();

    window.addEventListener("scroll", () => {
      updateEmojiIconPosition();
      updateMoreSettingsIconPosition();
    });

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

    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setIsEmojiPickerOpen(null); // Close emoji picker
        // setMessageSettingsHovered(null);
        setMessageSettingsOpened(null);
        // If emoji picker is open, do not reset message settings
        if (messageSettingsOpened) {
          return; // Keep the message settings open
        } else {
          // Reset message settings if no emoji picker is open
          setMessageSettingsHovered(null);
          setMessageSettingsOpened(null);
        }
      }

      if (
        moreSettingsRef.current &&
        !moreSettingsRef.current.contains(event.target as Node)
      ) {
        setMoreSettingsOpen(null); // Close more settings
        setMessageSettingsOpened(null);

        // If more settings are open, do not reset message settings
        if (messageSettingsOpened) {
          return; // Keep the message settings open
        } else {
          // Reset message settings if no more settings are open
          setMessageSettingsHovered(null);
          setMessageSettingsOpened(null);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);

    pusherClient.bind("messages", newMessageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`global-chat`));
      pusherClient.unbind("messages", newMessageHandler);
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", () => {
        updateEmojiIconPosition();
        updateMoreSettingsIconPosition();
      });
    };
  }, [
    messageSettingsHovered,
    messageSettingsOpened,
    isEmojiPickerOpen,
    moreSettingsOpen,
    setIsEmojiPickerOpen,
    setMessages,
    setMoreSettingsOpen,
  ]);

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
                // ?.name.split(" ")[0]
                globalChatUsers.find((user) => user.id === message.senderId)
                  ?.name
              }
            </p>
            <div
              onMouseEnter={() => handleMouseEnter(message.id)}
              // onMouseLeave={() => handleMouseLeave()}
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
                        onClick={() => {
                          scrollToMessage(message.replyToMessegeId);
                        }}
                        className={cn(
                          "px-4 py-2 cursor-pointer rounded-[24px] inline-block max-w-full break-words bg-gray-200 text-gray-900" // Add break-words
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
                    "order-1 items-center gap-1 flex-row-reverse ":
                      isCurrentUser,
                    "order-2 items-center gap-1 flex-row": !isCurrentUser,
                  })}
                >
                  <span
                    ref={(el) => (messageRefs.current[message.id] = el)} // Store the ref
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
                  {(messageSettingsHovered === message.id ||
                    messageSettingsOpened === message.id) && (
                    <div
                      className={cn("flex relative items-center gap-[2px]", {
                        "flex-row justify-start":
                          message.senderId !== session.user.id,
                        "flex-row-reverse justify-end":
                          message.senderId === session.user.id,
                      })}
                    >
                      {" "}
                      {isEmojiPickerOpen === message.id && (
                        <div
                          ref={emojiPickerRef}
                          className={cn(`absolute z-20`, {
                            "transform bottom-0 translate-y-[100%]":
                              emojiIconPosition.top < 420,
                            "bottom-6": emojiIconPosition.top > 420,
                            "right-0 transform ": isCurrentUser,
                            "left-0 transform ": !isCurrentUser,
                          })}
                        >
                          <EmojiPicker
                            onEmojiClick={(emoji) => {
                              console.log(emoji.emoji);
                            }}
                            searchDisabled={true}
                            skinTonesDisabled={true}
                            // lazyLoadEmojis={true}
                            width={340}
                            height={325}
                            className="shadow-md bg-red-300"
                          />
                        </div>
                      )}
                      {moreSettingsOpen === message.id && (
                        <div
                          ref={moreSettingsRef}
                          className={cn(`absolute z-20`, {
                            "transform bottom-0 translate-y-[100%]":
                              moreSettingIconPosition.top < 420,
                            "bottom-7": moreSettingIconPosition.top > 420,
                            "right-0 transform -translate-x-[30%]":
                              isCurrentUser,
                            "left-0 transform translate-x-[30%]":
                              !isCurrentUser,
                          })}
                        >
                          <MoreSettings message={message} />
                        </div>
                      )}
                      <Tooltip
                        delayDuration={0}
                        skipDelayDuration={0}
                        side="top"
                        align="center"
                        content={"React"}
                        arrowColor="text-rich_gray-900"
                        className="bg-rich_gray-900 relative z-30 rounded-md shadow-lg p-2 text-white text-xs min-w-7"
                        hideWhenDetached
                      >
                        <div
                          ref={emojiPickerIconRef}
                          onClick={() => handleEmojiPickerClick(message.id)}
                          className={cn(
                            "p-1 relative cursor-pointer hover:bg-gray-100 rounded-full text-rich_gray-900    hover:text-indigo-600"
                          )}
                        >
                          <SmileIcon className="w-4 h-4" />
                        </div>
                      </Tooltip>
                      <Tooltip
                        delayDuration={0}
                        skipDelayDuration={0}
                        content={"Reply"}
                        side="top"
                        align="center"
                        arrowColor="text-rich_gray-900"
                        className="bg-rich_gray-900 relative z-30 rounded-md shadow-lg p-2 text-white text-xs min-w-7"
                      >
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
                            "p-1 cursor-pointer hover:bg-gray-100 rounded-full text-rich_gray-900    hover:text-indigo-600"
                          )}
                        >
                          <Reply className="w-4 h-4" />
                        </div>
                      </Tooltip>
                      <Tooltip
                        delayDuration={0}
                        skipDelayDuration={0}
                        side="top"
                        align="center"
                        content={"More"}
                        arrowColor="text-rich_gray-900"
                        className="bg-rich_gray-900 relative z-30 rounded-md shadow-lg p-2 text-white text-xs min-w-7"
                      >
                        <div
                          ref={moreSettingsIconRef}
                          onClick={() => {
                            // setIsSettingsModalOpen(message.id);
                            handleMoreSettingsClick(message.id);
                          }}
                          className={cn(
                            "p-1 cursor-pointer relative hover:bg-gray-100 rounded-full text-rich_gray-900    hover:text-indigo-600"
                          )}
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </div>
                      </Tooltip>
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
