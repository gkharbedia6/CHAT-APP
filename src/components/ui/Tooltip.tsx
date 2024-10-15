import React, { AllHTMLAttributes } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { VariantProps } from "class-variance-authority";

interface TooltipProps
  extends AllHTMLAttributes<HTMLDivElement>,
    VariantProps<typeof TooltipPrimitive.TooltipContent> {
  children: React.ReactNode;
  content?: any;
  open?: any;
  defaultOpen?: any;
  onOpenChange?: any;
  arrowColor: string;
}

const Tooltip = ({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  arrowColor,
  ...props
}: TooltipProps) => {
  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content side="top" align="center" {...props}>
        {content}
        <TooltipPrimitive.Arrow
          width={11}
          height={5}
          fill="currentColor"
          className={`${arrowColor}`}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
};
export default Tooltip;
