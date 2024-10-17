"use client";

import { FC, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { X } from "lucide-react";

import { Message } from "@/lib/validations/message";
import Button from "@/ui/Button";
import { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { ReplyTo } from "@/app/(dashboard)/dashboard/chat/components/ClientChatGlobal";
import { User } from "@/types/db";

interface ChatInputProps {
  session: Session;
  sendMessage: (message: Message, input: string, tempId: string) => void;
  isReplying: boolean;
  setIsReplying: React.Dispatch<React.SetStateAction<boolean>>;
  setReplyTo: React.Dispatch<React.SetStateAction<ReplyTo | null>>;
  replyToUser: User | undefined;
  replyText: string | undefined;
}

const ChatInput: FC<ChatInputProps> = ({
  session,
  sendMessage,
  isReplying,
  setIsReplying,
  setReplyTo,
  replyToUser,
  replyText,
}) => {
  const [input, setInput] = useState<string>("");
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [isTyping, setIsTyping] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onSendMessage = async () => {
    if (!input) return;

    const timestamp = Date.now();
    const tempId = `temp-${timestamp}`; // Temporary ID to track optimistic message

    const tempMessage: Message = {
      id: tempId, // Temporary ID
      text: input,
      senderId: session.user.id,
      timestamp: timestamp,
      replyToUserId: "",
      replyToMessegeId: "",
    };

    sendMessage(tempMessage, input, tempId);

    setInput("");
    textareaRef.current?.focus();
  };

  return (
    // <div className="border-t border-black px-4 pt-4 mb-2 sm:mb-4">
    <div className="flex flex-col border-t border-black ">
      {isReplying && (
        <div className="h-10 w-full pt-2 mb-4">
          <div className="flex w-full flex-row justify-between px-4 items-center">
            <p className="text-sm">
              Replying to{" "}
              {replyToUser?.id === session.user.id
                ? "yourself"
                : replyToUser?.name}
            </p>
            <div
              onClick={() => setIsReplying(false)}
              className={cn(
                "p-1 cursor-pointer hover:bg-gray-100 rounded-full text-rich_gray-900  hover:text-indigo-600"
              )}
            >
              <X className="w-4 h-4" />
            </div>
          </div>
          <div className="flex w-full flex-row justify-start px-4 text-xs text-gray-400">
            {replyText}
          </div>
        </div>
      )}
      <div className="relative flex-1  overflow-hidden flex justify-between min-h-14 shadow-sm ring-none focus-within:ring-none">
        <TextareaAutosize
          autoFocus={true}
          onBlur={({ target }) => target.focus()}
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
              () => setIsReplying(false);
              () => setReplyTo(null);
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message...`}
          className="block w-full h-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:leading-6 sm:text-sm"
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
