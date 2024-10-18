"use client";

import { Reaction } from "@/types/db";
import React, { createContext, useContext, useState } from "react";

interface ReactionModalContextProviderProps {
  children: React.ReactNode;
}

interface ReactionModalContext {
  isReactionModalOpen: Reaction[] | null;
  setIsReactionModalOpen: React.Dispatch<
    React.SetStateAction<Reaction[] | null>
  >;
}

export const ReactionModalContext = createContext<ReactionModalContext | null>(
  null
);

const ReactionModalContextProvider = ({
  children,
}: ReactionModalContextProviderProps) => {
  const [isReactionModalOpen, setIsReactionModalOpen] = useState<
    Reaction[] | null
  >(null);

  return (
    <ReactionModalContext.Provider
      value={{
        isReactionModalOpen,
        setIsReactionModalOpen,
      }}
    >
      {children}
    </ReactionModalContext.Provider>
  );
};

export default ReactionModalContextProvider;

export const useReactionModalContext = () => {
  const context = useContext(ReactionModalContext);
  if (!context) {
    throw new Error(
      "useReactionModalContext must be within a ReactionModalContextProvider"
    );
  }

  return context;
};
