"use client";

import { useReactionModalContext } from "@/contexts/ReactionsModalcontext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface ReactionModalProps {
  session: Session;
}

const ReactionModal = ({ session }: ReactionModalProps) => {
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

  console.log(isReactionModalOpen);

  return (
    <>
      {isReactionModalOpen && (
        <div
          className={cn(
            "h-screen z-[-10] absolute top-0 left-0  w-screen flex items-center justify-center ",
            {
              "z-40": isReactionModalOpen,
            }
          )}
        >
          <div className="absolute top-0 left-0 bg-rich_gray-900 opacity-70 w-full h-full"></div>
          <div
            ref={modalRef}
            className="w-[400px] relative z-50 h-fit bg-white shadow-md flex flex-col items-center rounded-[16px] justify-start"
          >
            <div className="w-full flex-row h-12 relative itemce justify-center border-b-[1px] border-black">
              <h2 className="w-full h-full relative  flex items-center text-md font-bold justify-center ">
                Reactions
                <X
                  onClick={() => {
                    setIsReactionModalOpen(null);
                  }}
                  className="absolute top-3 right-3 cursor-pointer"
                />
              </h2>
            </div>
            <div className="flex w-full flex-col items-start py-3">
              {isReactionModalOpen.map((reaction) => (
                <div className="w-full">
                  <div
                    onClick={() => {
                      if (reaction.senderId === session.user.id) {
                        console.log("remove");
                        setIsReactionModalOpen(null);
                      }
                    }}
                    className="hover:bg-gray-100 p-2 px-5 cursor-pointer text-rich_gray-900 hover:text-indigo-600 rounded-sm flex flex-row justify-between items-center"
                  >
                    <div className="flex flex-row items-center justify-start gap-4">
                      <Image
                        className="w-14 rounded-full"
                        src={reaction.senderImageUrl ?? ""}
                        alt={`${reaction.senderName} Image`}
                        width={30}
                        height={30}
                      />
                      <div className="flex-col items-center justify-center ">
                        <h3 className="text-md">{reaction.senderName}</h3>
                        {reaction.senderId === session.user.id ? (
                          <span className="text-sm text-gray-400">
                            Select to remove
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <Image
                        className="w-5"
                        src={reaction.emoji?.imageUrl ?? ""}
                        alt={"Emoji"}
                        width={20}
                        height={20}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReactionModal;
