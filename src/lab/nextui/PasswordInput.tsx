import { Input, type InputProps } from "@/components/ui/input";
import { VisibilityToggle, type VisibilityProps } from "./VisibilityToggle";
import React, { useState, type FC } from "react";

interface Props extends InputProps {
  defaultVisible?: boolean;
}

export const PasswordInput: FC<Props> = React.forwardRef<
  HTMLInputElement,
  Props
>(({ defaultVisible = false, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);

  return (
    <Input
      type={isVisible ? "text" : "password"}
      {...props}
      ref={ref}
      endContent={
        <VisibilityToggle
          visible={isVisible}
          onClick={() => {
            setIsVisible((v) => !isVisible);
          }}
        />
      }
    />
  );
});
