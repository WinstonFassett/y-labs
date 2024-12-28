import { createStore, del, get, keys, set } from 'idb-keyval';
import { atom, onMount } from 'nanostores';
import { listDatabases } from './listDatabases';
import { getOfflineDocMeta } from "./local-yjs-idb-offline";

export interface DocMetadata {
  id: string;
  title?: string;
  type: string;
  savedAt: number;
}

const metaDb = createStore('docs-metadata', 'metadata');

export const $docMetas = Object.assign(atom<DocMetadata[]|undefined>(), {
  mounted: false
});

onMount($docMetas, () => {
  $docMetas.mounted = true;
  refreshDocMetadata();
  return () => {
    $docMetas.mounted = false;
  }
})

export async function saveDocMetadata(meta: DocMetadata) {
  await set(meta.id, meta, metaDb);
  if (!$docMetas.mounted) return;
  const current = $docMetas.get();
  $docMetas.set(current && [...current.filter(m => m.id !== meta.id), meta]);
}

export async function loadDocMetadata(id: string): Promise<DocMetadata | undefined> {
  return await get(id, metaDb);
}

export async function deleteDocMetadata(id: string) {  
  await del(id, metaDb);
  if (!$docMetas.mounted) return;
  const current = $docMetas.get();
  $docMetas.set(current && current.filter(m => m.id !== id));
}

export async function getAllDocMetadata(): Promise<DocMetadata[]> {
  const metas = $docMetas.get();
  if (metas && metas.length > 0) return metas;
  const allMetas: DocMetadata[] = await Promise.all(
    (await keys(metaDb)).map(async (id) => {
      return await get(id, metaDb) as DocMetadata;
    })
  )
  $docMetas.set(allMetas);
  return allMetas;
}

export async function refreshDocMetadata() {
  const databases = await listDatabases();
  const existingMetas = await getAllDocMetadata();
  const newMetas = []
  for (const dbName of databases) {
    const existing = existingMetas.find(m => m.id === dbName);
    if (!existing) {
      try {
        const metadata = await getOfflineDocMeta(dbName);
        const { title, name, type, ...rest } = metadata;
        newMetas.push({
          ...rest,    
          id: dbName,
          type,
          title: title ?? undefined,
          savedAt: Date.now()
        });
      } catch (err) {
        console.error(`Error loading metadata for ${dbName}`, err);
      }
    }
  }
  newMetas.forEach(m => saveDocMetadata(m));
}