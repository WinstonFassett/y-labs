import { cn } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import AppBar from "../shared/AppBar";
import { PasswordRequiredDialog } from "../shared/PasswordRequiredDialog";
import { getDocLoadState } from "../shared/store/doc-loader";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { useStoreIfPresent } from "../shared/useStoreIfPresent";
import Codemirror from "./Codemirror";

export function Editor({ className }: { className?: string }) {
  const { docId, roomId, needsPasswordToConnect, $roomConfig } = useDocCollabStore()
  const $loader = getDocLoadState(docId!, roomId!);
  const loadState = useStore($loader);
  const config = useStoreIfPresent($roomConfig);
  
  const loadingEncrypted = config && config.enabled && config.encrypt && loadState === "loading";
  const canShow = (!needsPasswordToConnect || loadState === "loaded") && !loadingEncrypted;
  // codemirror needs to rerender if password present but not loaded
  return (
    <div className={cn("flex flex-col", className)}>
      <AppBar />
      {!canShow && <div>Loading...</div>}
      {canShow && <Codemirror className="flex-1" />}
      <PasswordRequiredDialog />
    </div>
  );
}

export default Editor;
