import { cn } from "@/lib/utils";
import { FileQuestionIcon } from "lucide-react";

export const typeIconMap = {
  codemirror: (
    <img
      src="/y-labs/logos/codemirror.svg"
      alt="CodeMirror"
      className="h-8 w-8" />
  ),
  blocknote: (
    <img
      src="/y-labs/logos/blocknote.svg"
      alt="Blocknote"
      className="h-8 w-8" />
  ),
  blocksuite: (
    <img
      src="/y-labs/logos/blocksuite2.svg"
      alt="Blocksuite"
      className="h-8 w-8" />
  ),
  milkdown: (
    <img
      src="/y-labs/logos/milkdown.svg"
      alt="Milkdown"
      className="h-8 w-8" />
  ),
  novel: <img src="/y-labs/logos/novel.svg" alt="Novel" className="h-8 w-8" />,
  tldraw: (
    <img
      src="/y-labs/logos/tldraw.svg"
      alt="TL Tldraw Meta"
      className="h-8 w-8" />
  ),
  unknown: <FileQuestionIcon className="h-8 w-8" />,
};

export const FileTypeIcons = {
  codemirror: ({ className }: { className: string }) => (
    <img
      src="/y-labs/logos/codemirror.svg"
      alt="CodeMirror"
      className={cn("h-8 w-8", className)} />
  ),
  blocknote: ({ className }: { className: string }) => (
    <img
      src="/y-labs/logos/blocknote.svg"
      alt="Blocknote"
      className={cn("h-8 w-8", className)} />
  ),
  blocksuite: ({ className }: { className: string }) => (
    <img
      src="/y-labs/logos/blocksuite2.svg"
      alt="Blocksuite"
      className={cn("h-8 w-8", className)} />
  ),
  milkdown: ({ className }: { className: string }) => (
    <img
      src="/y-labs/logos/milkdown.svg"
      alt="Milkdown"
      className={cn("h-8 w-8", className)} />
  ),
  novel: ({ className }: { className: string }) => <img src="/y-labs/logos/novel.svg" alt="Novel" className={cn("h-8 w-8", className)} />,
  tldraw: ({ className }: { className: string }) => (
    <img
      src="/y-labs/logos/tldraw.svg"
      alt="TL Tldraw Meta"
      className={cn("h-8 w-8", className)} />
  ),
  unknown: ({ className }: { className: string }) => <FileQuestionIcon className={cn("h-8 w-8", className)} />,
};
