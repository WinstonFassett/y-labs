import { Button } from "@/components/ui/button.js";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog.js";

import { CreateDocButtons } from "./Drive.tsx";
import { useStore } from "@nanostores/react";
import { map } from "nanostores";

export const createDocumentState = Object.assign(
  map({
    visible: false,
  }),
  {
    setOpen(v: boolean) {
      createDocumentState.setKey("visible", v);
    },
    open() {
      createDocumentState.setOpen(true);
    },
    close() {
      createDocumentState.setOpen(false);
    },
  },
);

export function CreateDocumentDialogButton() {
  return (
    <>
      <Button color="primary" onClick={createDocumentState.open}>
        Create Document
      </Button>
    </>
  );
}

export function CreateDocumentDialog() {
  const isOpen = useStore(createDocumentState).visible;
  return (
    <>
      <Dialog
        placement="top"
        open={isOpen}
        onOpenChange={createDocumentState.setOpen}
      >
        <DialogContent>
          <>
            <DialogHeader className="flex flex-col gap-1">
              {/* Create new document */}
            </DialogHeader>
            {/* <DialogBody> */}
            <CreateDocButtons />
            {/* </DialogBody> */}
            <DialogFooter>
              <Button variant="outline" onClick={() => createDocumentState.setOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        </DialogContent>
      </Dialog>
    </>
  );
}
