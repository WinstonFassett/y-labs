import * as idb from "lib0/indexeddb";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { deleteDocMetadata } from "./doc-metadata";
import { getDocMeta } from "./extract-doc-meta";


export const getHasDocIdb = (id: string) => checkDatabaseExists(id);
function checkDatabaseExists(dbName: string): Promise<boolean> {
  return new Promise((resolve) => {
    let dbExists: boolean = true; // Assume the database exists
    const request: IDBOpenDBRequest = indexedDB.open(dbName);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      dbExists = false; // The database does not exist
      (event.target as IDBOpenDBRequest).result.close();
      idb.deleteDB(dbName);
    };

    request.onsuccess = (event: Event) => {
      (event.target as IDBOpenDBRequest).result.close(); // Close the database connection
      resolve(dbExists);
    };

    request.onerror = (event: Event) => {
      resolve(false);
    };
  });
}

export function getOfflineDoc(name: string, destroy = true) {
  const onLoad = () => {
    // console.log("loaded", name);
  };
  const ydoc = new Y.Doc();
  ydoc.gc = false;
  if (ydoc.isLoaded) {
    onLoad();
    return Promise.resolve(ydoc);
  } else {
    return new Promise<Y.Doc>((resolve, reject) => {

      const persister = new IndexeddbPersistence(name, ydoc);
      let resolver = resolve as typeof resolve | undefined;
      persister.once("synced", () => {
        onLoad();
        if (destroy) {
          persister.destroy();
        }
        resolver?.(ydoc);
      });

      persister._load.catch(err => {
        console.error("Error loading doc", name, err);
        reject?.(err);
        resolver = undefined;
      });
    });
  }
}

export function saveOfflineDoc(name: string, ydoc: Y.Doc = new Y.Doc()) {
  const persister = new IndexeddbPersistence(name, ydoc);
  return new Promise<void>((resolve, reject) => {
    persister.once("synced", () => {
      persister.destroy();
      resolve();
    });
  });
}

export async function getOfflineDocMeta(name: string) {
  const doc = await getOfflineDoc(name);
  const meta = getDocMeta(doc, name);
  doc.destroy();
  return meta;
}
export async function deleteOfflineDoc(name: string) {
  await deleteDocMetadata(name);
  await idb.deleteDB(name);
}
