import { Badge } from "@/components/ui/badge";
import { useStore } from "@nanostores/react";
import { AlertTriangleIcon, CheckIcon } from "lucide-react";
import { useVisuallyHidden } from "react-aria";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";
import { getDocIdbStore } from "./store/local-yjs-idb";

const checkbox = tv({
  slots: {
    base: "border-border border-2 hover:bg-border outline-none peer-focus:ring-2 ring-offset-2 ring-offset-background peer-focus:ring-ring w-8 h-8 p-0 sm:w-auto sm:px-2 items-center justify-center flex flex-col sm:flex-row",
    content: "text-default-500",
  },
  variants: {
    isSelected: {
      true: {
        base: "",
        content: "pl-1",
      },
    },
    isFocusVisible: {
      true: {
        base: "outline-none ring-2 ring-focus ring-offset-2 ring-offset-background",
      },
    },
  },
});

export function DocPersistenceToggle() {
  const { docId } = useParams();
  if (!docId) throw new Error("No document id specified");

  const $docOfflineStore = getDocIdbStore(docId);
  const { enabled, persister } = useStore($docOfflineStore);

  const styles = checkbox({ isSelected: enabled, isFocusVisible: false });

  let { visuallyHiddenProps } = useVisuallyHidden();
  return (
    <label>
      <input
        type="checkbox"
        {...visuallyHiddenProps}
        className="peer"
        onChange={() => {
          console.log("onChange", enabled);
          $docOfflineStore.setKey("enabled", !enabled);
        }}
      />
      <Badge variant="outline" className={styles.base()}>
          {enabled ? (
            <CheckIcon className="text-success" />
          ) : (
            <AlertTriangleIcon size={18} className="text-warning" />
          )}
        <span className="hidden sm:block">
          {enabled ? "Saved" : "Unsaved"}
        </span>
      </Badge>
    </label>
  );
}

export default DocPersistenceToggle;
