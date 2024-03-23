import React, { useState } from "react";
import {
  Button,
  Modal,
  Spinner,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalContent,
  Card,
  CardBody,
} from "@nextui-org/react";
import { useDropzone } from "react-dropzone";
import { getOfflineDoc } from "../shared/store/local-yjs-idb";
import * as Y from "yjs";
import { CheckCircleIcon, UploadCloudIcon, XCircle } from "lucide-react";
import { useStore } from "@nanostores/react";
import { map } from "nanostores";

const importDriveState = map({
  visible: false,
  importing: false,
  progress: 0,
  total: 0,
  errors: [] as string[],
});

export const ImportDriveButton: React.FC = () => {
  return (
    <>
      <Button onClick={() => importDriveState.setKey("visible", true)}>
        Import Yjs Docs
      </Button>
    </>
  );
};

export function ImportDriveModal() {
  const { visible } = useStore(importDriveState);
  // const [isOpen, setIsOpen] = useState(false);
  const isOpen = visible;
  const [uploadState, setUploadState] = useState<
    "initial" | "uploading" | "success" | "error"
  >("initial");

  const onDrop = (acceptedFiles: File[]) => {
    console.log("DROP");
    setUploadState("uploading");
    const file = acceptedFiles[0];
    if (file) {
      console.log("file", file);
      // Insert your file processing logic here, then set the upload state accordingly
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileContent = event.target?.result as string;
        console.log("File content:", fileContent);
        try {
          const json = JSON.parse(fileContent);
          console.log("JSON", json);
          await processImportedData(fileContent);
          onDone();
        } catch (error) {
          console.error("Failed to parse file content:", error);
          setUploadState("error");
        }
      };
      reader.readAsText(file);
      const onDone = () => {
        // Simulate file processing delay
        setUploadState("success");
        console.log("DONE");

        setTimeout(() => {
          importDriveState.setKey("visible", false);
          window.location.reload();
        }, 600); // Close modal after showing success message
      };
      // setTimeout(onDone, 1000);
    } else {
      setUploadState("error"); // Set to 'error' state if no file is processed
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const closeModal = () => {
    importDriveState.setKey("visible", false);
    setUploadState("initial"); // Reset upload state upon closing
  };
  return (
    <Modal placement="top" isOpen={isOpen} onClose={closeModal}>
      <ModalContent>
        <ModalHeader>Upload Yjs Document</ModalHeader>
        <ModalBody>
          {["initial", "uploading", "error"].includes(uploadState) && (
            <Card
              isPressable
              className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer ${isDragActive ? "bg-primary-300" : "bg-primary"} hover:bg-primary-300 text-primary-foreground`}
            >
              <CardBody>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />

                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloudIcon className="w-8 h-8 mb-4" />

                    {isDragActive ? (
                      <p>Drop the files here ...</p>
                    ) : uploadState === "initial" ? (
                      <p className="mb-2">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                    ) : null}

                    <p className="text-xs">Supported formats: .yjs.json</p>
                    {uploadState === "uploading" && <Spinner />}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
          {uploadState === "success" && (
            <div className="p-4 flex items-center gap-4 rounded border border-success-200 bg-success-400">
              <CheckCircleIcon className="text-success-foreground" />
              <p className="text-success-foreground">Import succeeded</p>
            </div>
          )}
          {uploadState === "error" && (
            <div className="p-4 flex items-center gap-4 rounded border border-danger-200 bg-danger-400">
              <XCircle className="text-danger-foreground" />
              <p className="text-danger-foreground">Import failed</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {/* Add any footer content here or leave blank */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ImportDriveButton;

async function processImportedData(fileContents: string): Promise<void> {
  try {
    console.log("PROCESSING");
    const docsData = JSON.parse(fileContents);
    const docNames = Object.keys(docsData);

    for (const docName of docNames) {
      const base64String = docsData[docName];
      const binaryData = Uint8Array.from(atob(base64String), (c) =>
        c.charCodeAt(0),
      );

      // Assuming you have an initialized Yjs doc and a way to apply changes to it
      // For instance, if you're using the y-indexeddb adapter
      // You should replace this with actual logic to update or create the document in your application
      console.log("loading", docName);
      const ydoc = await getOfflineDoc(docName, false); // getOfflineDoc should be your method to get or create Y.Doc
      await new Promise<void>((resolve, reject) => {
        console.log("got", docName);
        // const onSynced = () => {
        //   // clearTimeout(cancelTimeout);
        //   console.log("synced!!");
        //   ydoc.persister.off("synced", onSynced);
        //   resolve();
        // };
        // // const cancelTimeout = setTimeout(() => {
        // //   ydoc.off("synced", onSynced);
        // //   reject(new Error("Failed to sync document"));
        // // }, 10000);
        // ydoc.persister.once("synced", onSynced);
        Y.applyUpdate(ydoc, binaryData);
        resolve();
      });
    }
  } catch (error) {
    console.error("Failed to process imported data:", error);
    throw new Error("Failed to process imported data");
  }
}
