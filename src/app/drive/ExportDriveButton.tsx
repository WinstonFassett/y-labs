import { Button } from "@nextui-org/react";
import * as Y from "yjs";
import { getOfflineDoc } from "../shared/store/local-yjs-idb";
import { resolveShare } from "../shared/store/resolveShare";

export function ExportDriveButton() {
  return <Button onPress={doExport}>Export Drive</Button>;
}

export async function doExport() {
  console.log("Exporting drive...");
  const res = await exportAllYDocsToString();
  console.log("Exported drive:", res);
}
export async function doExportJson() {
  console.log("Exporting drive...");
  const res = await exportAllYDocsToString(true);
  console.log("Exported drive:", res);
}

async function doDownload(file: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function exportAllYDocsToString(asJson = false) {
  const docsData = {} as Record<string, any>; // Object to hold all document names and their serialized states
  const databases = await indexedDB.databases(); // Assuming this gives the Y-Doc names

  for (const db of databases) {
    try {
      const { name } = db;
      if (!name) continue;
      const ydoc = await getOfflineDoc(name);
      if (asJson) {
        docsData[name] = Object.fromEntries(
          ydoc.share.entries().map(([key, value]) => {
            const resolved = resolveShare(ydoc, key);
            return [key, resolved.toJSON()];
          }),
        );
        continue;
      }
      const encodedState = Y.encodeStateAsUpdate(ydoc);
      const base64String = btoa(
        String.fromCharCode.apply(null, new Uint8Array(encodedState)),
      );
      docsData[name] = base64String;
    } catch (error) {
      console.error(`Failed to export document ${db.name}:`, error);
    }
  }

  const content = JSON.stringify(docsData);
  doDownload(`drive-export${asJson ? "" : ".yjs"}.json`, content);
  return docsData;
}
