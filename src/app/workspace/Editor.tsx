import { cn } from "@/lib/utils";
import AppBar from "../shared/AppBar";
import { Workspace } from "./Workspace";
import NovelEditor from "./NovelEditor";

export function Editor({ className }: { className?: string }) {
  return (
    <NovelEditor />
    // <div className={cn("flex flex-col", className)}>
    //   soooon
    // </div>
  );
}

export default Editor;
