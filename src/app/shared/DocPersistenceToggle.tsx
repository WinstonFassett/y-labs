import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@nanostores/react";
import { cva } from "class-variance-authority";
import { AlertTriangleIcon, CheckIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { getDocIdbStore } from "./store/local-yjs-idb";
import { useDocLoadState } from "./useDocLoadState";

const buttonStyles = cva(
  "rounded-full transition-all w-9 sm:w-auto",
  {
    variants: {
      isSelected: {
        true: "border-none",
        false: "border-warning border-2",
      },
      isFocusVisible: {
        true: "outline-none ring-2 ring-focus ring-offset-2 ring-offset-background",
      },
    },
  }
);

export function DocPersistenceToggle() {
  const { docId } = useParams();
  if (!docId) throw new Error("No document id specified");
  const { loadState } = useDocLoadState();
  const $docOfflineStore = getDocIdbStore(docId);
  const { enabled } = useStore($docOfflineStore);

  const label = enabled ? "Saved" : "Unsaved"

  return (
    loadState !== 'loaded' ? 
      <Skeleton className="w-9 sm:w-[88px] h-9 rounded-full" />
     :
    <Button
      title={label}
      size="sm"
      variant="outline"
      className={buttonStyles({ isSelected: enabled, isFocusVisible: false })}
      onClick={() => {
        $docOfflineStore.setKey("enabled", !enabled);
      }}
    >
      {enabled ? (
        <CheckIcon className="text-success" />
      ) : (
        <AlertTriangleIcon size={18} className="text-warning" />
      )}
      <span className="hidden sm:block">
        {label}
      </span>
    </Button>
  );
}

export default DocPersistenceToggle;
