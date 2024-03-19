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

export function CreateDocumentDialogButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button color="primary" onPress={onOpen}>
        Create Document
      </Button>
      <Modal placement="top" isOpen={isOpen} onOpenChange={onOpenChange}>
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
