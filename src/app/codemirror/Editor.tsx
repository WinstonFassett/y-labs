import { cn } from "@/lib/utils";
import AppBar from "../shared/AppBar";
import Codemirror from "./Codemirror";
import { PasswordRequiredDialog } from "../shared/PasswordRequiredDialog";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { getDocLoadState } from "../shared/store/doc-loader";
import { useStore } from "@nanostores/react";
import { useStoreIfPresent } from "../shared/useStoreIfPresent";

export function Editor({ className }: { className?: string }) {
  const { docId, roomId, needsPasswordToConnect, $roomConfig } = useDocCollabStore()
  const $loader = getDocLoadState(docId!, roomId!);
  const loadState = useStore($loader);
  console.log("loadState", loadState);
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
