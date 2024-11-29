import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { atom, batched, type ReadableAtom } from "nanostores";
import { getDocRoomConfig } from "./doc-room-config";
import { getDocIdbStore } from "./local-yjs-idb";
import { getTrysteroDocRoom } from "./trystero-doc-room";
import { getYdoc } from "./yjs-docs";

interface DocLoadState {
  loadingOffline: LoadingState;
  loadingOnline: LoadingState;
  loading: LoadingState;
}

type LoadingState = "disabled" | "loading" | "loaded" | "error";

const docLoadStateT = mapTemplate(
  (id, roomId?: string) => {
    const store = atom("disabled" as LoadingState);
    const $offline = getDocIdbStore(id);
    const $room = roomId ? getTrysteroDocRoom(id, roomId) : undefined;
    return Object.assign(store, {
      $offline,
      $room,
    });
  },
  (store, id, roomId) => {
    const $docOfflineStore = getDocIdbStore(id);
    const $room = roomId ? getTrysteroDocRoom(id, roomId) : undefined;
    const $ydoc = getYdoc(id);
    const y = $ydoc.get();
    const $roomConfig = roomId ? getDocRoomConfig(id, roomId) : undefined;
    const config = $roomConfig?.get();
    const isLoaded = y.isLoaded;
    const enabled = config?.enabled ?? false;
    const initialState = roomId && !isLoaded ? "loading" : "loaded";
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
      // console.log("loader released", { id, roomId });
    };
  },
);

export function getDocLoadState(docId: string, roomId?: string) {
  return docLoadStateT(docId, roomId);
}
