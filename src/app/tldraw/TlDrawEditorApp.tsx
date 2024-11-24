import { cn } from "@/lib/utils";
import AppBar from "@/app/shared/AppBar";
import TlDrawEditor from "./TlDrawEditor";

export function TlDrawEditorApp({ className }: { className?: string }) {
  return (
    <div className={cn(className, "min-h-screen flex flex-col")}>
      <AppBar />
      <TlDrawEditor className="flex-1 flex flex-col" />
    </div>
  );
}

export default TlDrawEditorApp;
