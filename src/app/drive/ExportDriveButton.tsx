import { Button } from "@nextui-org/react";
import { documentsStore } from "./store";
import { getOfflineDoc } from "../shared/store/local-yjs-idb";
import * as Y from "yjs";

export function ExportDriveButton() {
  return <Button onPress={doExport}>Export Drive</Button>;
}

export async function doExport() {
  // Export the drive
  console.log("Exporting drive...");
  const res = await exportAllYDocsToString();
  console.log("Exported drive:", res);
  // const unsub = documentsStore.subscribe(async (docs) => {
  //   if (!docs) return;
  //   console.log("docs", docs);
  //   await Promise.resolve();
  //   unsub();
  // });
}

async function doDownload(file: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file;
  document.body.appendChild(a); // Append to body temporarily
  a.click();
  document.body.removeChild(a); // Clean up
  URL.revokeObjectURL(url); // Free up resources
}

async function exportAllYDocsToString() {
  const docsData = {} as Record<string, any>; // Object to hold all document names and their serialized states
  const databases = await indexedDB.databases(); // Assuming this gives the Y-Doc names

  for (const db of databases) {
    try {
      const { name } = db;
      if (!name) continue;
      // Use your function to load the document from IndexedDB
      const ydoc = await getOfflineDoc(name);
      // Serialize the Y.Doc state
      const encodedState = Y.encodeStateAsUpdate(ydoc);
      // Convert the binary encoded state to a base64 string for storage
      const base64String = btoa(
        String.fromCharCode.apply(null, new Uint8Array(encodedState)),
      );
      // Add the serialized state to the docsData object
      docsData[name] = base64String;
    } catch (error) {
      console.error(`Failed to export document ${db.name}:`, error);
      // Optionally, add error handling or continue to the next document
    }
  }

  // Convert the docsData object to a JSON string
  const content = JSON.stringify(docsData);
  doDownload("drive-export.yjs.json", content);
}
