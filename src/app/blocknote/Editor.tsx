import { cn } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import AppBar from "../shared/AppBar";
import { PasswordRequiredDialog } from "../shared/PasswordRequiredDialog";
import { getDocLoadState } from "../shared/store/doc-loader";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { LazyBlocknote } from "./lazy/editor";
import { useDocParams } from "../shared/useDocParams";

export function Editor({ className }: { className?: string }) {
  const { docId, type } = useDocParams({ type: 'blocknote' });
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId")
  const $loader = getDocLoadState(docId, roomId);
  const loadState = useStore($loader);
  const { needsPasswordToConnect } = useDocCollabStore(true);
  const canShow = !needsPasswordToConnect || loadState === "loaded";
  return (
    <div className={cn("w-full flex-1 max-w-3xl mx-auto flex flex-col", className)}>
      <AppBar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center m-auto">
            Loading BlockNote...
          </div>
        }
      >
        {loadState === "loading" && (
          <div className="flex-1 flex items-center">
            <div className="m-auto">
              <p>
                Loading from{" "}
                {$loader.$offline.$enabled.get()
                  ? "offline storage"
                  : "peers"}
              </p>
            </div>
          </div>
        )}
        {canShow && <LazyBlocknote
          autofocus
          key={docId}
          className={cn("flex-1", loadState === "loading" && "hidden")}
        />}
      
      </Suspense>
      <PasswordRequiredDialog />
    </div>
  );
}

export default Editor;
