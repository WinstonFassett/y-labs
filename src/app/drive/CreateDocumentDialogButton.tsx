import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
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
      <Button color="primary" onPress={createDocumentState.open}>
        Create Document
      </Button>
    </>
  );
}

export function CreateDocumentDialog() {
  const isOpen = useStore(createDocumentState).visible;
  return (
    <>
      <Modal
        placement="top"
        isOpen={isOpen}
        onOpenChange={createDocumentState.setOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {/* Create new document */}
              </ModalHeader>
              <ModalBody>
                <CreateDocButtons />
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Cancel</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
