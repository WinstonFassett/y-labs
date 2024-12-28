import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useStore } from "@nanostores/react";
import { CheckCircleIcon, UploadCloudIcon, XCircle } from "lucide-react";
import { map } from "nanostores";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import * as Y from "yjs";
import { getOfflineDoc } from "../shared/store/local-yjs-idb-offline";

const importDriveState = map({
  visible: false,
  // importing: false,
  // progress: 0,
  // total: 0,
  // errors: [] as string[],
});
export const startImport = () => importDriveState.setKey("visible", true);
export const ImportDriveButton: React.FC = () => {
  return (
    <>
      <Button onClick={startImport}>Import Yjs Docs</Button>
    </>
  );
};

export function ImportDriveModal() {
  const { visible } = useStore(importDriveState);
  const isOpen = visible;
  const [uploadState, setUploadState] = useState<
    "initial" | "uploading" | "success" | "error"
  >("initial");

  const onDrop = (acceptedFiles: File[]) => {
    setUploadState("uploading");
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileContent = event.target?.result as string;
        try {
          const json = JSON.parse(fileContent);
          await processImportedData(fileContent);
          onDone();
        } catch (error) {
          console.error("Failed to parse file content:", error);
          setUploadState("error");
        }
      };
      reader.readAsText(file);
      const onDone = () => {
        setUploadState("success");
        setTimeout(() => {
          importDriveState.setKey("visible", false);
          window.location.reload();
        }, 600);
      };
    } else {
      setUploadState("error");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [],
    },
  });

  const closeModal = () => {
    importDriveState.setKey("visible", false);
    setUploadState("initial");
  };
  return (
    <Dialog open={isOpen} onOpenChange={isOpen ? closeModal : undefined}>
      <DialogContent>
        <DialogHeader>Upload Yjs Document</DialogHeader>
        <div>
          {["initial", "uploading", "error"].includes(uploadState) && (
            <Card
              // isPressable
              className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer ${isDragActive ? "bg-primary-300" : "bg-primary"} hover:bg-primary-300 text-primary-foreground`}
            >
              <CardContent>
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
              </CardContent>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
      const ydoc = await getOfflineDoc(docName, false);
      await new Promise<void>((resolve, reject) => {
        Y.applyUpdate(ydoc, binaryData);
        resolve();
      });
    }
  } catch (error) {
    console.error("Failed to process imported data:", error);
    throw new Error("Failed to process imported data");
  }
}
