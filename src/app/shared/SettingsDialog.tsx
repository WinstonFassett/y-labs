import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { useStore } from "@nanostores/react";
import { CheckIcon, KeyRoundIcon, XIcon } from "lucide-react";
import { map } from "nanostores";
import { $openAiConfigValid, validateOpenAiKey } from "./store/openai";
import { $openaiApiKey, $openaiApiKey_masked } from "./store/secure-settings";
import { Switch } from "@/components/ui/switch";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { $trackHistoryWhenEditing } from "./store/local-settings";

export const $settingsStore = map({
  show: false,
});

export function SettingsDialog() {
  const open = useStore($settingsStore).show;
  const setOpen = (open: boolean) => $settingsStore.setKey("show", open);
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
      <DialogContent>
        <DialogHeader>
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            {/* <p className="text-muted-foreground font-thin">
              Customize your experience.
            </p> */}
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <EditorSettings />
          <AiSettings />
        </div>
        <DialogFooter>
          <Button
            type="reset"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CardTitle({ children }: { children: ReactNode }) {
  return <div className="text-xl font-bold">{children}</div>;
}

function CardDescription({ children }: { children: ReactNode }) {
  return <div className="text-sm font-normal">{children}</div>;
}

function Setting({ children }: { children: ReactNode }) {
  return <div className="text-sm">{children}</div>;
}

function SettingTitle({ children }: { children: ReactNode }) {
  return <div className="text-md font-bold pb-2">{children}</div>;
}

function SettingsForm() {
  return <>soon</>;
}

function EditorSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <TrackHistorySetting />
      </CardContent>
    </Card>
  );
}

export function TrackHistorySetting() {
  const trackHistory = useStore($trackHistoryWhenEditing);
  return (
    <div className="flex items-center justify-between">
      <Label>
        Track my edits (experimental)
      </Label>
      <Switch        
        checked={trackHistory}
        onCheckedChange={() => {$trackHistoryWhenEditing.update(!trackHistory)}}
      />
    </div>
  );
}

function AiSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI</CardTitle>
      </CardHeader>
      <CardContent>
        <OpenApiKeySetting />        
      </CardContent>
    </Card>
  )
}

function OpenApiKeySetting() {
  const openaiApiKeyMasked = useStore($openaiApiKey_masked);
  const apiKeyIsValid = useStore($openAiConfigValid);
  console.log({ apiKeyIsValid });
  return (
    <Setting>
      <SettingTitle>OpenAI API Key</SettingTitle>
      {openaiApiKeyMasked ? (
        <div className="flex items-center gap-2">
          {apiKeyIsValid === true ? (
            <CheckIcon color="green" />
          ) : apiKeyIsValid === false ? (
            <XIcon color="red" />
          ) : (
            <span>...</span>
          )}
          <div className="flex-1">Using: {openaiApiKeyMasked}</div>
          <Button
            size="sm"
            variant="destructive"
            // isIconOnly
            onClick={() => {
              $openaiApiKey.set(undefined);
            }}
          >
            <XIcon />
          </Button>
        </div>
      ) : (
        <OpenAiKeyForm />
      )}
    </Setting>
  );
}

const openaiValidate = async (value: string) => {
  return (await validateOpenAiKey(value)) ? true : "Invalid OpenAI SDK Key";
};

export function OpenAiKeyForm() {
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
  } = useForm({ mode: "onSubmit", reValidateMode: "onSubmit" });
  return (
    <form
      noValidate
      onSubmit={handleSubmit(async ({ openaiApiKey }) => {
        $openaiApiKey.set(openaiApiKey);
      })}
    >
      <div className="flex items-center gap-2">
        <Controller
          name="openaiApiKey"
          rules={{
            required: "Please enter a valid OpenAPI Key",
            validate: openaiValidate,
          }}
          control={control}
          render={({ field }) => (
            <div className="flex-1">
              <PasswordInput
                {...field}
                // className="text-default-400"
                value={field.value || ""}
                // isInvalid={!!errors.openaiApiKey}
                // isRequired
                // endContent={
                //   <KeyRoundIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                // }
                // placeholder="Enter your OpenAI API Key"
                // variant="bordered"
                // errorMessage={errors?.openaiApiKey?.message as string}
              />
            </div>
          )}
        ></Controller>
        <Button size="sm" color="primary" type="submit" isIconOnly>
          <CheckIcon />
        </Button>
        <Button size="sm" type="reset" variant="destructive" isIconOnly onClick={reset}>
          <XIcon />
        </Button>
      </div>
    </form>
  );
}
