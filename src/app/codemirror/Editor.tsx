import { cn } from "@/lib/utils";
import "@tldraw/tldraw/tldraw.css";
import AppBar from "../shared/AppBar";
import Codemirror from "./Codemirror";

export function Editor({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <AppBar />
      <Codemirror className="flex-1" />
    </div>
  );
}

export default Editor;
