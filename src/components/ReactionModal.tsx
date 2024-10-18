"use client";

import { useReactionModalContext } from "@/contexts/ReactionsModalcontext";
import { cn } from "@/lib/utils";
import { Reaction } from "@/lib/validations/reaction";
import { useEffect, useRef } from "react";

const ReactionModal = () => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const { isReactionModalOpen, setIsReactionModalOpen } =
    useReactionModalContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If emoji picker is open and clicked outside of it, close the picker
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsReactionModalOpen(null);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isReactionModalOpen, setIsReactionModalOpen]);

  return (
    <>
      {isReactionModalOpen && (
        <div
          className={cn(
            "h-screen z-[-10] absolute top-0 left-0  w-screen flex items-center justify-center",
            {
              "z-40": isReactionModalOpen,
            }
          )}
        >
          <div className="absolute top-0 left-0 bg-rich_gray-900 opacity-70 w-full h-full"></div>
          <div
            ref={modalRef}
            className="w-[400px] relative z-50 h-[250px] bg-white shadow-md flex flex-col items-center justify-start"
          >
            {isReactionModalOpen.map((reaction) => (
              <div key={`${reaction.messageId} - ${reaction.timestamp}`}>
                {reaction.senderId} {reaction.messageText}{" "}
                {reaction?.emoji?.emoji ?? ""}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ReactionModal;
