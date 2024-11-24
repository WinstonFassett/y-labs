import { Button } from "@/components/ui/button";
import { useStore } from "@nanostores/react";
import { cva } from "class-variance-authority";
import { AlertTriangleIcon, CheckIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { getDocIdbStore } from "./store/local-yjs-idb";

const buttonStyles = cva(
  "rounded-full border-2",
  {
    variants: {
      isSelected: {
        true: "",
        false: "border-warning",
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

  const $docOfflineStore = getDocIdbStore(docId);
  const { enabled, persister } = useStore($docOfflineStore);

  

  return (
    <Button
    size="sm"
      variant="outline"
      className={buttonStyles({ isSelected: enabled, isFocusVisible: false })}
      onClick={() => {
        console.log("onClick", enabled);
        $docOfflineStore.setKey("enabled", !enabled);
      }}
    >
      {enabled ? (
        <CheckIcon className="text-success" />
      ) : (
        <AlertTriangleIcon size={18} className="text-warning" />
      )}
      <span className="hidden sm:block">
        {enabled ? "Saved" : "Unsaved"}
      </span>
    </Button>
  );
}

export default DocPersistenceToggle;
