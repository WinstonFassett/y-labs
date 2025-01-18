"use client";

import { Command, CommandInput } from "../ui/command";

import { toast } from "sonner";
import { useEditor } from "novel";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import AISelectorCommands from "./ai-selector-commands";
import AICompletionCommands from "./ai-completion-command";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { ArrowUp } from "lucide-react";
import Magic from "../ui/icons/magic";
import CrazySpinner from "../ui/icons/crazy-spinner";
import { addAIHighlight } from "../extensions/ai-highlight";
import OpenAI from "openai";
import { useStore } from "@nanostores/react";
import { $openaiApiKey } from "@/app/shared/store/local-secure-settings";
import { createRecipeStepPrompt, parseRecipe } from "./createRecipeStepPrompt";
//TODO: I think it makes more sense to create a custom Tiptap extension for this functionality https://tiptap.dev/docs/editor/ai/introduction

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ open, onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const openaiRef = useRef<OpenAI | null>(null);
  const openaiApiKey = useStore($openaiApiKey);
  useEffect(() => {
    openaiRef.current = new OpenAI({
      dangerouslyAllowBrowser: true,
      apiKey: openaiApiKey,
    });
  }, []);

  const openai = openaiRef.current;

  const handleCompletion = async (
    // prompt: string,
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    replacer: (prevCompletion: string, newCompletion: string) => string = (
      prev,
      next,
    ) => next,
  ) => {
    setIsLoading(true);

    try {
      const response = await openai!.chat.completions.create({
        model: "gpt-4o",
        messages,
      });

      const newCompletion = response.choices[0].message.content!;
      setCompletion((prevCompletion) =>
        replacer(prevCompletion, newCompletion),
      );
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        toast.error("You have reached your request limit for the day.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    const slice = editor?.state.selection.content();
    const text =
      slice && editor?.storage.markdown.serializer.serialize(slice.content);

    handleCompletion([
      {
        role: "system",
        content: `
        You are an automation that cannot talk back. Only complete the current step. Do not work ahead.

        Input: 
        ${text}
        `,
      },
      { role: "user", content: inputValue },
      { role: "assistant", content: "OUTPUT:\n" },
    ]).then(() => setInputValue(""));
  };

  const hasCompletion = completion.length > 0;

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose dark:prose-invert p-2 px-4 prose-sm">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
          <Magic className="mr-2 h-4 w-4 shrink-0" />
          AI is thinking
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={
                hasCompletion
                  ? "Tell AI what to do next"
                  : "Ask AI to edit or generate..."
              }
              onFocus={() => editor && addAIHighlight(editor)}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
              onClick={handleComplete}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                editor?.chain().unsetAIHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            <AISelectorCommands
              onSelect={(value, option) => {
                switch (option) {
                  case "recipe":
                    const recipe = parseRecipe(value);
                    console.log("running recipe", recipe);
                    runRecipe(recipe, handleCompletion);
                    break;
                  default:
                    console.log("completing", { value, option });
                    handleCompletion([
                      { role: "user", content: `${option}: ${value}` },
                    ]).then(() => setInputValue(""));

                    break;
                }
              }}
            />
          )}
        </>
      )}
    </Command>
  );
}

async function runRecipe(
  {
    prompt,
    steps,
  }: {
    prompt: string;
    steps: string[];
  },
  handleCompletion: (
    prompts: {
      role: string;
      content: string;
    }[],
    replacer?: (prev: string, next: string) => string,
  ) => Promise<string>,
) {
  const outputs = [] as string[];
  for (let index = 0; index < steps.length; index++) {
    const stepPrompts = createRecipeStepPrompt({
      prompt,
      steps,
      index,
      outputs,
    });
    await handleCompletion(stepPrompts, (prev = "", value) => {
      outputs.push(value);
      return [prev, value].join("\n\n");
    });
  }
}
