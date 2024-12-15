import { useRef } from "react";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { useDocEditor } from "../shared/useDocEditor";
import { DualEditor } from "./DualEditor";

function RemirrorEditor({ className = "" }: { className?: string }) {
  const editor = useRef<HTMLDivElement>(null);
  const [theme] = useTheme();

  const { docId, currentDoc, $room, roomId, loadState, loaded, provider } = useDocEditor();
  const ytext = currentDoc.getText("prosemirror");

  return <div ref={editor} className={className}>
    <DualEditor />
  </div>;
}

export default RemirrorEditor;
