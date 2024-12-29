import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { atom, batched, type ReadableAtom } from "nanostores";
import { getDocRoomConfig } from "./doc-room-config";
import { getDocIdbStore } from "./local-yjs-idb";
import { getTrysteroDocRoom } from "./trystero-doc-room";
import { getYdoc } from "./yjs-docs";
import { $newDocIds } from "./new-doc-ids";


type LoadingState = "unloaded" | "loading" | "loaded" | "error";

const docLoadStateT = mapTemplate(
  (id, roomId?: string) => {
    const store = atom("unloaded" as LoadingState);
    const $offline = getDocIdbStore(id);
    const $room = roomId ? getTrysteroDocRoom(id, roomId) : undefined;
    function load () {
      return new Promise<void>((resolve, reject) => {
        const unsubscribe = store.subscribe(value => {
          if (value === 'loaded') {
            resolve()
            unsubscribe()
          } else if (value === 'error') {
            reject()
            unsubscribe()
          }
        })
      })
    }
    return Object.assign(store, {
      $offline,
      $room,
      load
    });
  },
  (store, id, roomId) => {
    const $docOfflineStore = getDocIdbStore(id);
    const $room = roomId ? getTrysteroDocRoom(id, roomId) : undefined;
    const $ydoc = getYdoc(id);
    const y = $ydoc.get();
    const $roomConfig = roomId ? getDocRoomConfig(id, roomId) : undefined;
    const isNew = $newDocIds.get().has(id);
    const initialState = isNew ? "loaded" : y.isLoaded ? "loaded" : (
      roomId ? "loading" : "unloaded"
    );
    store.set(initialState);
    const deps = [$docOfflineStore, $room, $ydoc, $roomConfig].filter(
      (x) => !!x,
    ) as ReadableAtom<any>[];
    const unsub = batched(deps, () => {}).listen(() => {});
    const onLoad = () => {
      store.set("loaded");
    };
    if (initialState !== "loaded") {
      y.once("load", onLoad);
    }
    return () => {
      unsub();
    };
  },
);

export function getDocLoadState(docId: string, roomId?: string) {
  return docLoadStateT(docId, roomId);
}
