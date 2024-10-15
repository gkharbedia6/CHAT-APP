"use client";

import { useSettingsModalContext } from "@/contexts/SettingsModalContext";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface SettingsModalProps {}

const SettingsModal = ({}: SettingsModalProps) => {
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
        console.log("click");

        setIsSettingsModalOpen(null);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isSettingsModalOpen]);

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
            className="w-[400px] relative z-50 h-[250px] bg-white shadow-md flex flex-col items-center justify-start"
          ></div>
        </div>
      )}
    </>
  );
};

export default SettingsModal;
