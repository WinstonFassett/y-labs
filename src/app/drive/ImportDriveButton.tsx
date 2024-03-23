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

export const ImportDriveButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
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
        const json = JSON.parse(fileContent);
        console.log("JSON", json);
        await processImportedData(fileContent);
        onDone();
      };
      reader.readAsText(file);
      const onDone = () => {
        // Simulate file processing delay
        setUploadState("success");
        console.log("DONE");

        setTimeout(() => setIsOpen(false), 2000); // Close modal after showing success message
      };
      // setTimeout(onDone, 1000);
    } else {
      setUploadState("error"); // Set to 'error' state if no file is processed
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const closeModal = () => {
    setIsOpen(false);
    setUploadState("initial"); // Reset upload state upon closing
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Import Yjs Docs</Button>
      isOpen = {isOpen.toString()}
      <Modal placement="top" isOpen={isOpen} onClose={closeModal}>
        <ModalContent>
          <ModalHeader>Upload Yjs Document</ModalHeader>
          <ModalBody>
            <Card
              isPressable
              className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer ${isDragActive ? "bg-primary-300" : "bg-primary"} hover:bg-primary-300 text-primary-foreground`}
            >
              <CardBody>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />

                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 "
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    {isDragActive ? (
                      <p>Drop the files here ...</p>
                    ) : uploadState === "initial" ? (
                      <p className="mb-2">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                    ) : null}

                    <p className="text-xs">Supported formats: .yjs.json</p>
                    {/* {isDragActive ? (
                      <p>Drop the files here ...</p>
                    ) : uploadState === "initial" ? (
                      <p>Drag 'n' drop some files here, or click to select files</p>
                    ) : null} */}
                    {uploadState === "uploading" && <Spinner />}
                    {uploadState === "success" && (
                      <p>File successfully uploaded!</p>
                    )}
                    {uploadState === "error" && (
                      <p>Failed to upload file. Please try again.</p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </ModalBody>
          <ModalFooter>
            {/* Add any footer content here or leave blank */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImportDriveButton;

async function processImportedData(fileContents: string): Promise<void> {
  try {
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
