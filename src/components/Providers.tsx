"use client";

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      {/* <TooltipProvider delayDuration={500} skipDelayDuration={200}> */}
      <Toaster position="top-center" reverseOrder={false} />
      {children}
      {/* </TooltipProvider> */}
    </>
  );
};

export default Providers;
