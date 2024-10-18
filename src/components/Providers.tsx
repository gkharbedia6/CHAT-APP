"use client";

import ReactionModalContextProvider from "@/contexts/ReactionsModalcontext";
import SettingsModalContextProvider from "@/contexts/SettingsModalContext";
import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <SettingsModalContextProvider>
        <ReactionModalContextProvider>{children}</ReactionModalContextProvider>
      </SettingsModalContextProvider>
    </>
  );
};

export default Providers;
