import { Loading } from "@/components/ui/loading";
import { useDocEditor } from "../shared/useDocEditor";
import { DualEditor } from "./DualEditor";

function RemirrorEditor({ className = "" }: { className?: string }) {  
  const it = useDocEditor()
  if (!it.loaded) return <Loading />
  return <DualEditor />  
}

export default RemirrorEditor;
