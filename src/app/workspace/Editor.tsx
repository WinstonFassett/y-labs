import { cn } from "@/lib/utils";
import AppBar from "../shared/AppBar";
import { Workspace } from "./Workspace";

export function Editor({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <AppBar />
      <Workspace />
    </div>
  );
}

export default Editor;
