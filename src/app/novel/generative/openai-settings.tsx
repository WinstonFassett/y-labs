import { computed, map } from "nanostores";
import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import { Button } from "../ui/button";
import { $openaiApiKey } from "@/app/shared/store/secure-settings";

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
        <Button>AI...</Button>
      </DialogTrigger>
      <DialogContent className="z-[10000]">
        <DialogTitle>Yoooo</DialogTitle>
        <form
          className="flex gap-2"
          onSubmit={handleSubmit((data) => {
            console.log("submit: ", data);
            // // onClose();
            $openaiApiKey.set(data.openaiApiKey);
            setOpen(false);
          })}
          // noValidate
        >
          <input
            type="password"
            placeholder="OpenAI API Key"
            className="flex-1 bg-background p-1 text-sm outline-none"
            defaultValue={"soon"}
            {...register("openaiApiKey", { required: true })}
          />

          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
