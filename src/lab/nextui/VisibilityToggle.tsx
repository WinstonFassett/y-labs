import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@nextui-org/react";

export interface VisibilityProps {
  visible: boolean;
}

interface Props extends VisibilityProps {
  className?: string;
  onClick: () => void;
}

export function VisibilityToggle({
  visible = true,
  onClick,
  className,
}: Props) {
  return (
    <button
      className={cn(className, "focus:outline-none")}
      type="button"
      onClick={onClick}
    >
      {visible ? <EyeIcon /> : <EyeOffIcon />}
    </button>
  );
}
