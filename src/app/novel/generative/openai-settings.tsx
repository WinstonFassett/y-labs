import { $openaiApiKey } from "@/app/shared/store/secure-settings";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { OpenAiKeyForm } from "@/app/shared/SettingsDialog";

export function OpenAiSettings() {
  return (
    <div>
      <OpenAiDialog />
    </div>
  );
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 1000));
export function OpenAiDialog() {
  const [open, setOpen] = useState(false);
  const {
    register,
    trigger,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useForm();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-purple-500">
          AI...
        </Button>
      </DialogTrigger>
      <DialogContent className="z-[10000]">
        <DialogTitle>Configure AI</DialogTitle>
        <OpenAiKeyForm />
      </DialogContent>
    </Dialog>
  );
}
