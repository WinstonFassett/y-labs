import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "./copy-button";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
}
export const PasswordInput = ({
  value,
  onChange,
  disabled,
  readOnly,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex space-x-2">
      <div className="relative flex-1">
        <Input
          {...props}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-0 top-0 h-full"
          onClick={(e) => {
            e.preventDefault();
            setShowPassword(!showPassword);
          }}
        >
          <AnimatePresence initial={false} mode="wait">
            {showPassword ? (
              <motion.div
                key="eyeoff"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <EyeOff className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="eye"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Eye className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
      <CopyButton value={value} label="password" />
    </div>
  );
};
