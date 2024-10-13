"use client";

import { FC, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { Message } from "@/lib/validations/message";
import Button from "@/ui/Button";
import { Session } from "next-auth";

interface ChatInputProps {
  session: Session;
  sendMessage: (message: Message, input: string, tempId: string) => void;
}

const ChatInput: FC<ChatInputProps> = ({ session, sendMessage }) => {
  const [input, setInput] = useState<string>("");
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [isTyping, setIsTyping] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onSendMessage = async () => {
    if (!input) return;

    const tempId = `temp-${Date.now()}`; // Temporary ID to track optimistic message

    const tempMessage = {
      id: tempId, // Temporary ID
      text: input,
      senderId: session.user.id,
      timestamp: Date.now(),
    };

    sendMessage(tempMessage, input, tempId);

    setInput("");
    textareaRef.current?.focus();
  };

  return (
    // <div className="border-t border-black px-4 pt-4 mb-2 sm:mb-4">
    <div>
      <div className="relative flex-1 overflow-hidden flex justify-between min-h-14 shadow-sm ring-none border-t border-black focus-within:ring-none">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message...`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:leading-6 sm:text-sm"
        />

        <div className="min-h-full flex-1 justify-center flex items-center py-2 pr-2">
          <div className="flex-shrink-0">
            <Button
              variant={"ghost"}
              // isLoading={isLoading}
              onClick={onSendMessage}
              type="submit"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
