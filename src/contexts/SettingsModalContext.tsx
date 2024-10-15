"use client";

import React, { createContext, useContext, useState } from "react";

interface SettingsModalContextProviderProps {
  children: React.ReactNode;
}

interface SettingsModalContext {
  isSettingsModalOpen: string | null;
  setIsSettingsModalOpen: React.Dispatch<React.SetStateAction<string | null>>;
}

export const SettingsModalContext = createContext<SettingsModalContext | null>(
  null
);

const SettingsModalContextProvider = ({
  children,
}: SettingsModalContextProviderProps) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<string | null>(
    null
  );

  return (
    <SettingsModalContext.Provider
      value={{
        isSettingsModalOpen,
        setIsSettingsModalOpen,
      }}
    >
      {children}
    </SettingsModalContext.Provider>
  );
};

export default SettingsModalContextProvider;

export const useSettingsModalContext = () => {
  const context = useContext(SettingsModalContext);
  if (!context) {
    throw new Error(
      "useSettingsModalContext must be within a SettingsModalContextProvider"
    );
  }

  return context;
};
