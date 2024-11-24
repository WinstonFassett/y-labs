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
  novel: <img src="/y-labs/logos/novel.svg" alt="Novel" className="h-8 w-8" />,
  tldraw: (
    <img
      src="/y-labs/logos/tldraw.svg"
      alt="TL Tldraw Meta"
      className="h-8 w-8" />
  ),
  unknown: <FileQuestionIcon className="h-8 w-8" />,
};
