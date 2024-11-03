import { cn } from "@/lib/utils";
import AppBar from "../shared/AppBar";

export function Editor({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <AppBar />
      <div>Editor goes here</div>
    </div>
  );
}

export default Editor;
