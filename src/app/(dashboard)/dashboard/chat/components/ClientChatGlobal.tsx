"use client";

import ChatInput from "@/components/ChatInput";
import { Session } from "next-auth";
import { Message } from "@/lib/validations/message";

import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import MessagesGlobal from "./MessagesGlobal";
import { EmojiClickData } from "emoji-picker-react";
import { User } from "@/types/db";

export interface ReplyTo {
  text: string;
  replyToUserId: string;
  replyToMessegeId: string;
}

interface ClientChatGlobalProps {
  globalChatUsers: User[];
  initialMessages: Message[];
  session: Session;
}

const ClientChatGlobal = ({
  globalChatUsers,
  initialMessages,
  session,
}: ClientChatGlobalProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);

  const sendMessage = async (
    message: Message,
    input: string,
    tempId: string
  ) => {
    // Optimistically add message to the Messages component
    const tempMessage: Message = {
      ...message,
      replyToUserId: replyTo?.replyToUserId ?? "",
      replyToMessegeId: replyTo?.replyToMessegeId ?? "",
    };
    setMessages((prev) => [tempMessage, ...prev]);
    setIsReplying(false);

    // setIsLoading(true);
    try {
      await axios.post("/api/message/send-global", {
        text: input,
        timestamp: tempMessage.timestamp,
        replyToUserId: replyTo?.replyToUserId ?? "",
        replyToMessegeId: replyTo?.replyToMessegeId ?? "",
      });
      // No need to update the state here since Pusher will handle the new message
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      // Remove the temp message from state in case of error
      setReplyTo(null);
      setMessages((prev) => prev.filter((message) => message.id !== tempId));
    } finally {
      // setIsLoading(false);
      setReplyTo(null);
    }
  };

  const reactToMessage = async (
    emoji: EmojiClickData,
    messageId: string,
    timestamp: number
  ) => {
    try {
      await axios.post("/api/reaction/add", {
        emoji: emoji,
        messageId: messageId,
        timestamp: timestamp,
      });
    } catch (error) {
      console.log("err", error);
    } finally {
    }
  };

  return (
    <>
      <MessagesGlobal
        globalChatUsers={globalChatUsers}
        messages={messages}
        session={session}
        setMessages={setMessages}
        setIsReplying={setIsReplying}
        setReplyTo={setReplyTo}
        reactToMessage={reactToMessage}
      />
      <ChatInput
        isReplying={isReplying}
        setIsReplying={setIsReplying}
        sendMessage={sendMessage}
        session={session}
        setReplyTo={setReplyTo}
        replyToUser={globalChatUsers.find(
          (user) => user.id === replyTo?.replyToUserId
        )}
        replyText={replyTo?.text}
      />
    </>
  );
};

export default ClientChatGlobal;
