"use client";

import { useSettingsModalContext } from "@/contexts/SettingsModalContext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

const SettingsModal = () => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const { isSettingsModalOpen, setIsSettingsModalOpen } =
    useSettingsModalContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If emoji picker is open and clicked outside of it, close the picker
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsSettingsModalOpen(null);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isSettingsModalOpen, setIsSettingsModalOpen]);

  return (
    <>
      {isSettingsModalOpen && (
        <div
          className={cn(
            "h-screen z-[-10] absolute top-0 left-0  w-screen flex items-center justify-center",
            {
              "z-40": isSettingsModalOpen,
            }
          )}
        >
          <div className="absolute top-0 left-0 bg-rich_gray-900 opacity-70 w-full h-full"></div>
          <div
            ref={modalRef}
            className="w-[400px] relative z-50 min-h-fit bg-white shadow-md flex flex-col items-center rounded-[16px] justify-start"
          >
            <div className="w-full min-h-[140px] h-full flex flex-col relative items-center justify-center border-b-[1px] border-black">
              <h2 className="w-full relative  flex-col text-lg  flex items-center font-bold justify-center ">
                Unsend Message?
              </h2>
              <p className="text-sm text-gray-400 px-10 flex-wrap text-center">
                This will remove the message for everyone but people may have
                seen it already.
              </p>
            </div>
            <div className="flex w-full flex-col items-start h-[50%] cursor-pointer">
              <div
                onClick={() => {
                  console.log("undend msg");
                }}
                className="h-12 p-2 w-full flex items-center justify-center text-red-500 font-bold border-b-[1px] border-black"
              >
                Unsend
              </div>
              <div
                onClick={() => {
                  setIsSettingsModalOpen(null);
                }}
                className="h-12 p-2 w-full flex items-center justify-center text-rich_gray-900"
              >
                Cancel
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsModal;
