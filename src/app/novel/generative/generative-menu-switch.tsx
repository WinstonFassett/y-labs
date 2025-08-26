import { $openaiApiKey } from "@/app/shared/store/local-secure-settings";
import { useStore } from "@nanostores/react";
import { EditorBubble, useEditor } from "novel";
import { Fragment, useEffect, type ReactNode } from "react";
import { removeAIHighlight } from "../extensions/ai-highlight";
import { Button } from "../ui/button";
import Magic from "../ui/icons/magic";
import { AISelector } from "./ai-selector";
import { OpenAiSettings } from "./openai-settings";

interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const GenerativeMenuSwitch = ({
  children,
  open,
  onOpenChange,
}: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();

  useEffect(() => {
    if (!open && editor) removeAIHighlight(editor);
  }, [open]);

  const openApiKey = useStore($openaiApiKey);
  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
          editor?.chain().unsetAIHighlight().run();
        },
      }}
      className="flex w-fit max-w-[90vw] overflow-x-auto rounded-md border border-muted bg-background shadow-xl"
    >
      {open ? (
        <AISelector open={open} onOpenChange={onOpenChange} />
      ) : openApiKey ? (
        <Fragment>
          <Button
            className="gap-1 rounded-none text-purple-500"
            variant="ghost"
            onClick={() => onOpenChange(true)}
            size="sm"
          >
            <Magic className="h-5 w-5" />
            Ask AI
          </Button>
          {children}
        </Fragment>
      ) : (
        <Fragment>
          <OpenAiSettings />
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
