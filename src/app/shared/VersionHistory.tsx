import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useStore } from "@nanostores/react";
import { Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getDocVersionsStoreByDocEditor } from "./store/doc-versions";

export function VersionHistory() {
  const { docId, type } = useParams();

  const versionHistoryStore = getDocVersionsStoreByDocEditor(docId, type);
  const { displayVersionId } = useStore(versionHistoryStore);
  const versions = useStore(versionHistoryStore.$versions);

  const versionArray = Array.from(versions).reverse();
  const len = versionArray.length;
  const selectedRef = useRef<HTMLButtonElement>(null);
  const currentVersionId = displayVersionId ?? versionArray[0]?.id;

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
    <div className=" rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      <div className="shrink-0 flex items-center gap-2 border-b">
        <Clock className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold py-2">Version History</h2>
      </div>

      <div className="overflow-y-auto flex-1 space-y-2">
        {versionArray.length === 0 ? (
          <p className="text-gray-500 text-sm">No versions yet</p>
        ) : (
          versionArray.map((version, idx) => {
            const versionKey = version.id;
            return (
              <Button
                key={versionKey}
                ref={versionKey === currentVersionId ? selectedRef : null}
                variant="outline"
                onClick={() => versionHistoryStore.switchToVersion(versionKey)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  versionKey === currentVersionId
                    ? "bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-950 border border-transparent"
                }`}
              >
                <div className="flex flex-col justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Version {len - idx}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(version.date).toLocaleTimeString()}
                  </span>
                </div>
                {/* <div>{versionKey}</div> */}
              </Button>
            );
          })
        )}
      </div>
    </div>
  );
}
