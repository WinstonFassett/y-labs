import {
  ArrowDownFromLineIcon,
  CheckCheck,
  MessageCircleQuestionIcon,
  Minimize2Icon,
  SparkleIcon,
  SparklesIcon,
  StepForward,
  Wand2Icon
} from "lucide-react";
import { useEditor } from "novel";
import { getPrevText } from "novel/utils";
import { CommandGroup, CommandItem, CommandSeparator } from "../ui/command";

const options = [
  {
    value: "improve",
    label: "Improve writing",
    icon: SparklesIcon,
  },
  {
    value: "explain",
    label: "Explain",
    icon: MessageCircleQuestionIcon,
  },
  {
    value: "Summarize",
    label: "Summarize",
    icon: SparkleIcon,
  },

  {
    value: "fix",
    label: "Fix grammar",
    icon: CheckCheck,
  },
  {
    value: "shorter",
    label: "Make shorter",
    icon: Minimize2Icon,
  },
  {
    value: "longer",
    label: "Make longer",
    icon: ArrowDownFromLineIcon,
  },

];

interface AISelectorCommandsProps {
  onSelect: (value: string, option: string) => void;
}

const AISelectorCommands = ({ onSelect }: AISelectorCommandsProps) => {
  const { editor } = useEditor();
  if (!editor) return null;
  return (
    <>
      <CommandGroup heading="Edit or review selection">
        {options.map((option) => (
          <CommandItem
            onSelect={(value) => {
              const slice = editor.state.selection.content();
              const text = editor.storage.markdown.serializer.serialize(
                slice.content,
              );
              onSelect(text, value);
            }}
            className="flex gap-2 px-4"
            key={option.value}
            value={option.value}
          >
            <option.icon className="h-4 w-4 text-purple-500" />
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Use AI to do more">
        <CommandItem
          onSelect={() => {
            const text = getPrevText(editor, 5000);
            onSelect(text, "continue");
          }}
          value="continue"
          className="gap-2 px-4"
        >
          <StepForward className="h-4 w-4 text-purple-500" />
          Continue writing
        </CommandItem>
        <CommandItem 
          key="recipe"
          value="recipe"
          className="gap-2 px-4"
          onSelect={(value) => {
            const slice = editor.state.selection.content();
            const text = editor.storage.markdown.serializer.serialize(
              slice.content,
            );
            onSelect(text, value)
          }}>
          <Wand2Icon className="h-4 w-4 text-purple-500" />
          Multistep Prompt
          </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AISelectorCommands;
