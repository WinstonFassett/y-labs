import React from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AlertTriangleIcon, CheckIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { getDocIdbStore } from "./store/local-yjs-idb";
import { useStore } from "@nanostores/react";
import { Badge } from "@/components/ui/badge";

export function DocPersistenceToggle() {
  const { docId } = useParams();
  if (!docId) throw new Error("No document id specified");

  const $docOfflineStore = getDocIdbStore(docId);
  const { enabled, persister } = useStore($docOfflineStore);

  // const styles = checkbox({ isSelected: enabled, isFocusVisible });

  return (
    <label>
      <VisuallyHidden>
        <input
          {...{}}
          onChange={() => {
            console.log("onChange", enabled);
            $docOfflineStore.setKey("enabled", !enabled);
          }}
        />
      </VisuallyHidden>
      <Badge
        classNames={
          {
            // base: styles.base(),
            // content: styles.content(),
          }
        }
        startContent={
          enabled ? (
            <CheckIcon className="ml-1 text-success" />
          ) : (
            <AlertTriangleIcon size={18} className="ml-1 text-warning" />
          )
        }
        variant="faded"
        {...{}}
      >
        {enabled ? "Saved" : "Unsaved"}
      </Badge>
    </label>
  );
}

export default DocPersistenceToggle;
