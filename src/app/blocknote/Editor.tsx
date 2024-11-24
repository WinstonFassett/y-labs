import { Suspense } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AppBar from "../shared/AppBar";
import { LazyBlocknote } from "./lazy/editor";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { useStore } from "@nanostores/react";
import { atom } from "nanostores";
import { getDocLoadState } from "../shared/store/doc-loader";
import { cn } from "@/lib/utils";

export function useDocParams() {
  const { docId } = useParams();
  if (!docId) {
    console.log("No document id specified");
  }

  return { docId };
}

export function Editor({ className }: { className?: string }) {
  const { docId } = useDocParams();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room")
  const $loader = getDocLoadState(docId, roomId);
  const loadState = useStore($loader);
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
          
          <LazyBlocknote
            autofocus
            key={docId}
            className={cn("flex-1", loadState === "loading" && "hidden")}
          />
        
        </Suspense>
      </div>
    </div>
  );
}

export default Editor;
