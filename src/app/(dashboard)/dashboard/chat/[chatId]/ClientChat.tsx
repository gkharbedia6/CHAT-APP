"use client";

import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { Session } from "next-auth";
import { Message } from "@/lib/validations/message";
import { useState } from "react";

interface ClientChatProps {
  initialMessages: Message[];
  session: Session;
  chatPartner: User;
  chatId: string;
}

const ClientChat = ({
  initialMessages,
  session,
  chatPartner,
  chatId,
}: ClientChatProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  return (
    <>
      <Messages
        messages={messages}
        session={session}
        chatPartner={chatPartner}
        setMessages={setMessages}
        chatId={chatId}
      />
      <ChatInput
        chatPartner={chatPartner}
        chatId={chatId}
        setMessages={setMessages} // Pass the setMessages function
        session={session}
      />
    </>
  );
};

export default ClientChat;
