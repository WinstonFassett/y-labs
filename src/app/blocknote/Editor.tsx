import { Suspense } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AppBar from "../shared/AppBar";
import { LazyBlocknote } from "./lazy/editor";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { useStore } from "@nanostores/react";
import { atom } from "nanostores";
import { getDocLoadState } from "../shared/store/doc-loader";
import { cn } from "@/lib/utils";
import { PasswordRequiredDialog } from "../shared/PasswordRequiredDialog";

export function useDocParams() {
  const { docId } = useParams();  
  return { docId };
}

export function Editor({ className }: { className?: string }) {
  const { docId } = useDocParams();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId")
  const $loader = getDocLoadState(docId, roomId);
  const loadState = useStore($loader);
  const { needsPasswordToConnect } = useDocCollabStore(true);
  const canShow = !needsPasswordToConnect || loadState === "loaded";
  return (
    <div className={cn("w-full flex-1 mx-auto relative", className)}>
      <div className="max-w-3xl mx-auto h-full flex flex-col">
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
      </div>
      <PasswordRequiredDialog />
    </div>
  );
}

export default Editor;
