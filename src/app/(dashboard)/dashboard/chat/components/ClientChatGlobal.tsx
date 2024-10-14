"use client";

import ChatInput from "@/components/ChatInput";
import { Session } from "next-auth";
import { Message } from "@/lib/validations/message";

import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import MessagesGlobal from "./MessagesGlobal";

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

  const sendMessage = async (
    message: Message,
    input: string,
    tempId: string
  ) => {
    // Optimistically add message to the Messages component
    setMessages((prev) => [message, ...prev]);

    // setIsLoading(true);
    try {
      await axios.post("/api/message/send-global", { text: input });
      // No need to update the state here since Pusher will handle the new message
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      // Remove the temp message from state in case of error
      setMessages((prev) => prev.filter((message) => message.id !== tempId));
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <>
      <MessagesGlobal
        globalChatUsers={globalChatUsers}
        messages={messages}
        session={session}
        setMessages={setMessages}
      />
      <ChatInput sendMessage={sendMessage} session={session} />
    </>
  );
};

export default ClientChatGlobal;
