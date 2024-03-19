import { atom, map, onMount } from "nanostores";
import { getOfflineDocMeta } from "../shared/store/local-yjs-idb";

export const documentsStore = atom<Record<string, any>[]>([]);

export async function loadDocuments() {
  const databases = await indexedDB.databases();
  documentsStore.set([]);
  for (const db of databases) {
    const name = db.name;
    if (!name) continue;
    const metadata = await getOfflineDocMeta(name);
    documentsStore.set([...documentsStore.get(), { name, ...metadata }]);
  }
}

onMount(documentsStore, () => {
  loadDocuments();
});
