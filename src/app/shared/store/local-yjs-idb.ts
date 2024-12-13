import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { storeKey } from "@/lib/nanostores-utils/storeKey";
import * as idb from "lib0/indexeddb";
import { computed, map, onSet } from "nanostores";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { $docMetas, deleteDocMetadata, saveDocMetadata } from "./doc-metadata";
import { getYdoc } from "./yjs-docs";
import { debounce } from "../../../lib/debounce";

interface DocIdbStoreFields {
  enabled: boolean;
  persister: IndexeddbPersistence | undefined;
  loaded: boolean;
}

const docIdbStoreT = mapTemplate(
  (id) => {
    const store = map({
      enabled: false,
      persister: undefined as IndexeddbPersistence | undefined,
      loaded: false,
    });
    const $enabled = storeKey(store, "enabled");
    const $loaded = storeKey(store, "loaded");

    const $y = getYdoc(id);
    const $persister = computed([$y, $enabled], (y, enabled) => {
      if (!enabled) return undefined;
      const persister = new IndexeddbPersistence(id, y);
      persister.once("synced", () => {
        if (!y.isLoaded) {
          y.emit("load", []);
        } 
        store.setKey("loaded", true);

        const alreadySavedMetadata = $docMetas.get()?.find((m) => m.id === id);
        const meta = getDocMeta(y, id);
        saveDocMetadata({
          ...alreadySavedMetadata,
          ...meta,
          id,
          savedAt: alreadySavedMetadata?.savedAt ?? Date.now(),
        });

      });
      return persister;
    });

    onSet($persister, async ({ newValue }) => {
      const oldPersister = $persister.value;
      if (oldPersister) {
        oldPersister.destroy();
        await Promise.all([
          idb.deleteDB(id),
          deleteDocMetadata(id)
        ])
      }
    });

    return Object.assign(store, {
      $enabled,
      $loaded,
      $persister,
      persister: $persister.value,
    });
  },
  // on mount
  (store, id) => {
    const { $persister, $enabled } = store;
    getHasDocIdb(id).then((exists) => {
      if ($enabled.get()) return;
      $enabled.update(exists);
    });
    const unsubPersister = $persister?.subscribe((v) => {
      store.persister = v;
    });
    // watch doc and update meta
    const $y = getYdoc(id);
    const ydoc = $y.get()
    const saveMetadataDebounced = debounce(() => {
      const meta = getDocMeta(ydoc, id);
      saveDocMetadata({
        ...meta,
        id,
        savedAt: Date.now(),
      });
    }, 1000)
    
    const onUpdate = (...args: any[]) => {
      if (!ydoc.isLoaded) return;
      saveMetadataDebounced();
    }
    ydoc.on("update", onUpdate);

    return () => {
      ydoc.off("update", onUpdate);
      unsubPersister?.();
    };
  },
);

export const getDocIdbStore = docIdbStoreT;

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
  ydoc.gc = false
  if (ydoc.isLoaded) {
    onLoad();
    return Promise.resolve(ydoc);
  } else {
    return new Promise<Y.Doc>((resolve, reject) => {
      const persister = new IndexeddbPersistence(name, ydoc);
      persister.once("synced", () => {
        onLoad();
        if (destroy) {
          persister.destroy();
        }
        resolve(ydoc);
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
function getDocMeta(doc: Y.Doc, name: string) {
  const meta = doc.getMap("meta").toJSON() as { [key: string]: any; title?: string; };
  const shares = Array.from(doc.share.keys()) as string[];
  console.log('shares', shares)
  console.log('meta', meta, )
  const type = shares.find((s) => !Ignores.includes(s)) || "unknown";
  if (type === 'blocks') return 'blocksuite'
  return Object.assign(meta, { name, type });
}

const Ignores = ["meta", "versions", "tldraw_meta"];

export async function deleteOfflineDoc(name: string) {
  await deleteDocMetadata(name);
  await idb.deleteDB(name);
}

