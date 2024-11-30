import { cn } from "@/lib/utils";
import AppBar from "@/app/shared/AppBar";
import TlDrawEditor from "./TlDrawEditor";
import { PasswordRequiredDialog } from "../shared/PasswordRequiredDialog";

export function TlDrawEditorApp({ className }: { className?: string }) {
  return (
    <div className={cn(className, "h-dvh flex flex-col")}>
      <AppBar />
      <TlDrawEditor className="flex-1 flex flex-col" />
      <PasswordRequiredDialog />
    </div>
  );
}

export default TlDrawEditorApp;
