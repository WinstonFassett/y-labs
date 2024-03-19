import React from "react";
import { useCheckbox, Chip, VisuallyHidden, tv } from "@nextui-org/react";
import { AlertTriangleIcon, CheckIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { getDocIdbStore } from "./store/local-yjs-idb";
import { useStore } from "@nanostores/react";

const checkbox = tv({
  slots: {
    base: "border-default hover:bg-default-200",
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
  const {
    children,
    // isSelected,
    isFocusVisible,
    getBaseProps,
    getLabelProps,
    getInputProps,
  } = useCheckbox({
    defaultSelected: false,
  });
  const { docId } = useParams();
  if (!docId) throw new Error("No document id specified");

  const $docOfflineStore = getDocIdbStore(docId);
  const { enabled, persister } = useStore($docOfflineStore);

  const styles = checkbox({ isSelected: enabled, isFocusVisible });

  return (
    <label {...getBaseProps()}>
      <VisuallyHidden>
        <input
          {...getInputProps()}
          onChange={() => {
            console.log("onChange", enabled);
            $docOfflineStore.setKey("enabled", !enabled);
          }}
        />
      </VisuallyHidden>
      <Chip
        classNames={{
          base: styles.base(),
          content: styles.content(),
        }}
        startContent={
          enabled ? (
            <CheckIcon className="ml-1 text-success" />
          ) : (
            <AlertTriangleIcon size={18} className="ml-1 text-warning" />
          )
        }
        variant="faded"
        {...getLabelProps()}
      >
        {children ? children : enabled ? "Saved" : "Unsaved"}
      </Chip>
    </label>
  );
}

export default DocPersistenceToggle;
