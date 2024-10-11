"use client";

import { FC, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import axios from "axios";
import toast from "react-hot-toast";

import Button from "@/ui/Button";
import { pusherClient, pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

interface ChatInputProps {
  chatPartner: User;
  chatId?: string;
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async () => {
    if (!input) return;
    setIsLoading(true);
    try {
      await axios.post("/api/message/send", { text: input, chatId });
      setInput("");
      textareaRef.current?.focus();
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    // console.log(e.currentTarget.value.length > 0);
    // pusherServer.trigger(toPusherKey(`is-typing:${chatId}`), 'typing', {
    //   isTyping: true,
    // });
  };

  // useEffect(() => {
  //   pusherClient.subscribe(toPusherKey(`is-typing:${chatId}`));

  //   const isTypingHandler = (typing: boolean) => {
  //     setIsTyping(typing);
  //     console.log(isTyping);
  //   };

  //   pusherClient.bind('typing', isTypingHandler);

  //   return () => {
  //     pusherClient.unsubscribe(toPusherKey(`is-typing:${chatId}`));

  //     pusherClient.unbind('typing', isTypingHandler);
  //   };
  // }, []);

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-4">
      <div className="relative flex-1 overflow-hidden flex justify-between min-h-14 rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-none">
        <TextareaAutosize
          onInput={handleInputChange}
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message...`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:leading-6 sm:text-sm"
        />

        {/* <div
          onClick={() => textareaRef.current?.focus()}
          className="py-2"
          aria-hidden="true"
        >
          <div className="py-px ">
            <div className="h-9" />
          </div>
        </div> */}

        <div className="min-h-full flex-1 justify-center flex items-center py-2 pr-2">
          <div className="flex-shrink-0">
            <Button
              // isLoading={isLoading}
              onClick={sendMessage}
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
