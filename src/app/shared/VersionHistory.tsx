import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Version } from "@/lib/yjs-versions";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { checkIfLatestVersion } from "./store/doc-versions";
import { useDocLoadState } from "./useDocLoadState";
import { useStoreIfPresent } from "./useStoreIfPresent";
import { useVersionHistory } from "./useVersionHistory";

export function VersionHistory() {
  const { docId, type } = useParams();
  const { displayVersionId, $versionHistory } = useVersionHistory()    
  const versions = useStoreIfPresent($versionHistory?.$versions) || [];

  const versionArray = Array.from(versions).reverse();
  const len = versionArray.length;
  const selectedRef = useRef<HTMLButtonElement>(null);
  const currentVersionId = displayVersionId ?? versionArray[0]?.id;
  const { loadState } = useDocLoadState()
  
  // autoscroll to selected version
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentVersionId]);

  if (!docId) {
    return (
      <Alert variant="destructive">
        <p>No document selected</p>
      </Alert>
    );
  }
  return (
    <div className=" rounded-lg overflow-hidden flex flex-col h-full">
      <div className="overflow-y-auto flex-1 space-y-2">
        {
          loadState !== 'loaded' ? (
            <VersionHistorySkeleton />
          ) : (

            versionArray.length === 0 ? (
              <p className="p-3 text-gray-500 text-sm">No versions yet</p>
            ) : (
              versionArray.map((version, idx) => {
                const versionKey = version.id;
                const isLatest = checkIfLatestVersion(versionKey, versions as Version[]);
                return (
                  <Button
                    key={versionKey}
                    ref={versionKey === currentVersionId ? selectedRef : null}
                    variant="outline"
                    onClick={() => $versionHistory!.switchToVersion(versionKey)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      versionKey === currentVersionId
                        ? "bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-950 border border-transparent"
                    }`}
                  >
                    <div className="flex flex-col justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Version {len - idx}{isLatest && " (Latest)"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(version.date).toLocaleTimeString()}
                      </span>
                    </div>
                  </Button>
                );
              })
            )
          )
        }
      </div>
    </div>
  );
}

function VersionHistorySkeleton () {
  return (<>
    {Array.from({ length: 10 }).map((_, idx) => <Skeleton className="h-8 w-full rounded-lg" />)}
  </>)
}
