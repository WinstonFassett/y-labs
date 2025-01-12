import { useRef } from "react";
import { useTheme } from "../../lib/astro-tailwind-themes/useTheme";
import { useDocEditor } from "../shared/useDocEditor";
import { DualEditor } from "./DualEditor";
import { Loading } from "@/components/ui/loading";

function RemirrorEditor({ className = "" }: { className?: string }) {  
  const it = useDocEditor()
  if (!it.loaded) return <Loading />
  return <DualEditor />  
}

export default RemirrorEditor;
