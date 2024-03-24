import { atom, map, onMount } from "nanostores";
import { getOfflineDocMeta } from "../shared/store/local-yjs-idb";

export const documentsStore = atom<Record<string, any>[] | undefined>(
  undefined,
);

export async function loadDocuments() {
  const databases = await indexedDB.databases();
  const documents: Array<Record<string, any>> = [];
  for (const db of databases) {
    const name = db.name;
    if (!name) continue;
    const metadata = await getOfflineDocMeta(name);
    documents.push({ name, ...metadata });
  }
  documentsStore.set(documents);
}

onMount(documentsStore, () => {
  loadDocuments();
});
