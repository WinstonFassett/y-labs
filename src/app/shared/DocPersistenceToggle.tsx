import { Badge } from "@/components/ui/badge";
import { useStore } from "@nanostores/react";
import { AlertTriangleIcon, CheckIcon } from "lucide-react";
import { VisuallyHidden } from "react-aria";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";
import { getDocIdbStore } from "./store/local-yjs-idb";

const checkbox = tv({
  slots: {
    base: "border-border border-2 hover:bg-border",
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

  // const {
  //   children,
  //   // isSelected,
  //   isFocusVisible,
  //   getBaseProps,
  //   getLabelProps,
  //   getInputProps,
  // } = useCheckbox({
  //   defaultSelected: false,
  // });

  // let { visuallyHiddenProps } = useVisuallyHidden();
  return (
    <label>
      <VisuallyHidden>
        <input
          type="checkbox"
          onChange={() => {
            console.log("onChange", enabled);
            $docOfflineStore.setKey("enabled", !enabled);
          }}
        />
      </VisuallyHidden>
      <Badge variant="outline" className={styles.base()}>
        <span>
          {enabled ? (
            <CheckIcon className="ml-1 text-success" />
          ) : (
            <AlertTriangleIcon size={18} className="ml-1 text-warning" />
          )}
        </span>
        {enabled ? "Saved" : "Unsaved"}
      </Badge>
    </label>
  );
}

export default DocPersistenceToggle;
