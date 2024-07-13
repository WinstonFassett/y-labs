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
  console.log({ errors });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>AI...</Button>
      </DialogTrigger>
      <DialogContent className="z-[10000]">
        <DialogTitle>Configure AI</DialogTitle>
        <form
          className="flex gap-2"
          onSubmit={handleSubmit((data) => {
            $openaiApiKey.set(data.openaiApiKey);
            setOpen(false);
          })}
        >
          <div className="flex-1">
            <div>
              <input
                type="password"
                placeholder="Enter your OpenAI API Key"
                className="w-full bg-background p-1 text-sm outline-none"
                {...register("openaiApiKey", {
                  required: "Required",
                })}
              />
            </div>
            <div className="text-xs text-red-500 pl-1">
              {errors.openaiApiKey && errors.openaiApiKey.message?.toString()}
            </div>
          </div>
          <Button
            variant="outline"
            type="reset"
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
