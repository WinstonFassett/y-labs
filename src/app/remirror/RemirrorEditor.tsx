import { useRef } from "react";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { useDocEditor } from "../shared/useDocEditor";
import { DualEditor } from "./DualEditor";

function RemirrorEditor({ className = "" }: { className?: string }) {  
  return <DualEditor />
  // return <div ref={editor} className={className}>
  // </div>;
}

export default RemirrorEditor;
