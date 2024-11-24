import { atom, map, onMount } from "nanostores";
import { getOfflineDocMeta } from "../shared/store/local-yjs-idb";

const UNTITLED = "[Untitled]";

export const documentsStore = atom<Record<string, any>[] | undefined>(
  undefined,
);

const EXCLUDES = ["docs-metadata"];

export async function loadDocuments() {
  const databases = (await indexedDB.databases()).filter(x => !EXCLUDES.includes(x.name ??""));
  const documents: Array<Record<string, any>> = [];
  for (const db of databases) {
    const name = db.name;
    if (!name) continue;
    const metadata = await getOfflineDocMeta(name);
    documents.push({ name, ...metadata });
  }
  documents.sort((a, b) => (a.title ?? UNTITLED).localeCompare(b.title ?? UNTITLED));
  documentsStore.set(documents);
}

onMount(documentsStore, () => {
  loadDocuments();
});
