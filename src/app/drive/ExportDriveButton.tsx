import { Button } from "@/components/ui/button";
import * as Y from "yjs";
import { getOfflineDoc } from "../shared/store/local-yjs-idb";
import { resolveShare } from "../shared/store/resolveShare";
import { getAllDocMetadata } from "../shared/store/doc-metadata";

export function ExportDriveButton() {
  return <Button onClick={doExport}>Export Drive</Button>;
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
  
  const allDocs = await getAllDocMetadata()

  for (const docInfo of allDocs) {
    try {
      const { id } = docInfo;
      if (!id) continue;
      const ydoc = await getOfflineDoc(id);
      if (asJson) {
        docsData[id] = Object.fromEntries(
          Array.from(ydoc.share.entries()).map(([key, value]) => {
            const resolved = resolveShare(ydoc, key);
            return [key, resolved.toJSON()];
          }),
        );
        continue;
      }
      const encodedState = Y.encodeStateAsUpdate(ydoc);
      const base64String = btoa(
        String.fromCharCode.apply(null, encodedState as any),
      );
      docsData[id] = base64String;
    } catch (error) {
      console.error(`Failed to export document ${docInfo.id}:`, error);
    }
  }

  const content = JSON.stringify(docsData);
  doDownload(`drive-export${asJson ? "" : ".yjs"}.json`, content);
  return docsData;
}
