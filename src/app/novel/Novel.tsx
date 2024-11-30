"use client";
// import { defaultEditorContent } from "./content";
import type { EditorInstance } from "novel";
import {
  EditorBubble,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  // EditorInstance,
  EditorRoot,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import {defaultExtensions} from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";

import { cn } from "@/lib/utils";
import { TextButtons } from "./selectors/text-buttons";
import { suggestionItems } from "./slash-command";

import type { Extension } from "@tiptap/core";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import "./styles/prosemirror.css";
import "./tiptap-collab.css";

export const Novel = ({
  autofocus = false,
  className,
  extensions,
}: {
  autofocus?: boolean;
  className?: string;
  extensions?: Extension<any, any>[];
  disableHistory?: boolean;
}) => {
  const baseExtensions = defaultExtensions;
  extensions = extensions
    ? ([...baseExtensions, ...extensions] as any)
    : baseExtensions;
  const [saveStatus, setSaveStatus] = useState("Saved");

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON();

      window.localStorage.setItem("novel-content", JSON.stringify(json));
      setSaveStatus("Saved");
    },
    500,
  );

  return (
    <div className={cn("flex-1 flex flex-col", className)}>
      <EditorRoot>
        <EditorContent
          autofocus={autofocus}
          // initialContent={initialContent}
          extensions={extensions}
          className="[&>:first-child]:flex-1 [&>:first-child]:flex [&>:first-child]:flex-col  flex-1 flex flex-col max-w-screen-lg"
          editorProps={{
            // ...defaultEditorProps,
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class: `flex-1 flex flex-col prose dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />

            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default Novel;
