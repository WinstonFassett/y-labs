import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { storeKey } from "@/lib/nanostores-utils/storeKey";
import * as idb from "lib0/indexeddb";
import { computed, map, onSet } from "nanostores";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { getYdoc } from "./yjs-docs";

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

    getHasDocIdb(id).then((exists) => {
      $enabled.update(exists);
    });

    const $y = getYdoc(id);
    const $persister = computed([$y, $enabled], (y, enabled) => {
      if (!enabled) return undefined;
      const persister = new IndexeddbPersistence(id, y);
      persister.once("synced", () => {
        if (!y.isLoaded) {
          y.emit("load", []);
        }
        store.setKey("loaded", true);
      });
      return persister;
    });

    onSet($persister, ({ newValue }) => {
      const oldPersister = $persister.value;
      if (oldPersister) {
        oldPersister.destroy();
        idb.deleteDB(id).then(() => {
          // console.log("deleted", id);
        });
      }
    });

    return Object.assign(store, {
      $enabled,
      $loaded,
      $persister,
      persister: $persister.value,
    });
  },
  (store, id) => {
    const { $persister } = store;
    const unsubPersister = $persister?.subscribe((v) => {
      store.persister = v;
    });
    // console.log("mount local-yjs-idb config");
    return () => {
      // console.log("unload idb config");
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

export async function listDatabases() {
  if (!indexedDB?.databases) {
    console.warn("unable to list databases");
    return Promise.resolve([] as string[]);
  }
  return (await indexedDB.databases()).map(({ name }) => name!);
}

export async function getOfflineDoc(name: string) {
  const store = getDocIdbStore(name);
  const onLoad = () => {
    // console.log("loaded", name);
  };
  const ydoc = new Y.Doc();
  if (ydoc.isLoaded) {
    onLoad();
    return Promise.resolve(ydoc);
  } else {
    return new Promise<Y.Doc>((resolve, reject) => {
      const persister = new IndexeddbPersistence(name, ydoc);
      persister.once("synced", () => {
        onLoad();
        persister.destroy();
        resolve(ydoc);
      });
    });
  }
}

export async function getOfflineDocMeta(name: string) {
  const doc = await getOfflineDoc(name);
  const meta = doc.getMap("meta").toJSON();
  meta.name = name;
  const shares = Array.from(doc.share.keys()) as string[];
  meta.type =
    shares.find((s) => s !== "meta" && s !== "tldraw_meta") || "unknown";
  doc.destroy();
  return meta;
}
