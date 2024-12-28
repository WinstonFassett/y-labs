import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { storeKey } from "@/lib/nanostores-utils/storeKey";
import * as idb from "lib0/indexeddb";
import { computed, map, onSet } from "nanostores";
import { IndexeddbPersistence } from "y-indexeddb";
import { $docMetas, deleteDocMetadata, saveDocMetadata } from "./doc-metadata";
import { getYdoc } from "./yjs-docs";
import { debounce } from "../../../lib/debounce";
import { getDocMeta } from "./extract-doc-meta";
import { getHasDocIdb } from "./local-yjs-idb-offline";

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


