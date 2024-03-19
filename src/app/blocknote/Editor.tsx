import { cn } from "@nextui-org/react";
import { Suspense } from "react";
import { useParams } from "react-router-dom";
import AppBar from "../shared/AppBar";
import { LazyBlocknote } from "./lazy/editor";
import { useDocCollabStore } from "../shared/useDocCollabStore";
import { useStore } from "@nanostores/react";
import { atom } from "nanostores";
import { getDocLoadState } from "../shared/store/doc-loader";

export function useDocParams() {
  const { docId } = useParams();
  if (!docId) {
    alert("No document id specified");
  }

  return { docId };
}

export function Editor({ className }: { className?: string }) {
  const { docId, ydoc, $room, roomId } = useDocCollabStore();
  const $loader = getDocLoadState(docId, roomId);
  const loadState = useStore($loader);
  const fragment = ydoc.getXmlFragment("blocknote");
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
          {!!ydoc && (
            <LazyBlocknote
              autofocus
              key={docId}
              provider={$room?.provider}
              fragment={fragment}
              className={cn("flex-1", loadState === "loading" && "hidden")}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default Editor;
