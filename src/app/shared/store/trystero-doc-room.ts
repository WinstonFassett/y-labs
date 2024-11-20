import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { TrysteroProvider } from "@/lib/yjs-trystero/y-trystero";
import {
  atom,
  map,
  onMount,
  type MapStore,
  type ReadableAtom,
} from "nanostores";
import { selfId, type Room } from "trystero";
import type { Doc } from "yjs";
import { createRoom } from "../createRoom";
import { getDocRoomConfig, type DocRoomConfigFields, roomConfigsByDocId } from "./doc-room-config";
import { getYdoc } from "./yjs-docs";
import { user } from "./local-user";

interface TrysteroDocRoomProps {
  y: Doc;
  room: Room;
}

interface TrysteroDocRoom extends TrysteroDocRoomProps {
  peerId: string;
  room: Room;
  provider: TrysteroProvider;
  disconnect: () => void;
  $awarenessStates: ReadableAtom<Map<string, any>>;
}
export interface OnlineDocRoomFields {
  peerIds: string[];
  synced: boolean;
  loaded: boolean;
}

export interface TrysteroDocRoomModel
  extends TrysteroDocRoom,
    MapStore<OnlineDocRoomFields> {}

function createTrysteroDocRoom(
  docRoomId: string,
  y: Doc,
  roomId: string,
  config: DocRoomConfigFields,
  store = map({
    loaded: false,
    synced: false,
  } as OnlineDocRoomFields),
) {
  store.setKey("peerIds", [] as string[]);

  const $awarenessStates = atom(new Map());
  onMount($awarenessStates, () => {
    const onChange = ({
      added,
      updated,
      removed,
    }: {
      added: number[];
      updated: number[];
      removed: number[];
    }) => {
      const states = provider.awareness.getStates();
      $awarenessStates.set(states);
    };
    provider.awareness.on("change", onChange);
    return () => {
      provider.awareness.off("change", onChange);
    };
  });

  const peerId = selfId;

  
  const trysteroRoom = createTrysteroRoomForStore(roomId, store);

  const password = config.encrypt ? config.password : undefined;
  
  const provider = new TrysteroProvider(y, roomId, trysteroRoom, { password, accessLevel: config.accessLevel });
  
  const unsubUser = user.subscribe((user) => {
    setUserInAwareness(user);
  });

  provider.on('status', ({ connected }: { connected: boolean }) => {
    if (connected) {
      provider.awareness.setLocalState(provider.awareness.getLocalState());
    }
  });

  provider.on("synced", ({ synced }: { synced: boolean }) => {
    store.setKey("synced", synced);
    if (synced && !store.get().loaded) {
      store.setKey("loaded", true);
      if (!y.isLoaded) {
        y.emit("load", []);
      }
    }
  });

  provider.on("peers", ({ added, removed }:{removed: string[], added: string[]}) => {
    store.setKey("peerIds", store.get().peerIds.concat(added).filter((it) => !removed.includes(it)));
  })

  function setUserInAwareness(user: Readonly<{ username: string; color: string; }>) {
    provider.awareness.setLocalState({
      user: {
        color: user.color,
        name: user.username, // for y codemirror
        userName: user.username,
      },
    })
  }

  function disconnect() {
    const { provider } = model;
    provider.room?.disconnect()
    ;(trysteroRoom as any).leftAt = new Date();
    store.setKey("peerIds", []);

  }

  function destroy () {
    disconnect();
    unsubUser();
  }

  async function reconnect () {
    setUserInAwareness(user.get());
    const trysteroRoom = createTrysteroRoomForStore(roomId, store)
    await provider.connectTrystero(trysteroRoom)
  }
  
  const model = Object.assign(store, {
    y,
    peerId,
    disconnect,
    reconnect,
    destroy,
    room: trysteroRoom,
    provider,
    $awarenessStates,
  });
  return model;
}

const trysteroDocRoomT = mapTemplate(
  (id, docId: string, roomId: string) =>
    Object.assign(map({} as OnlineDocRoomFields), {
      id,
      docId,
      roomId,
    }),
  (store, docRoomKey, docId, roomId) => {
    const $config = getDocRoomConfig(docId, roomId);
    let config = $config.get();
    const unsubConfig = $config.listen(() => {});
    const $ydoc = getYdoc(docId);
    let y: Doc = $ydoc.get();
    const unsubDoc = $ydoc.listen(() => {});
    const $docRoom = createTrysteroDocRoom(
      docRoomKey,
      y,
      roomId,
      config,
      store as any,
    );
    return () => {
      const y = store.value;
      $docRoom?.disconnect();
      unsubDoc();
      unsubConfig();
    };
  },
);

function createTrysteroRoomForStore(roomId: string, store: MapStore<OnlineDocRoomFields>) {
  const trysteroRoom = createRoom(roomId);
  trysteroRoom.onPeerJoin((peerId) => {
    store.setKey("peerIds", store.get().peerIds.concat(peerId));
  });
  trysteroRoom.onPeerLeave((peerId) => {
    store.setKey(
      "peerIds",
      store.get().peerIds.filter((it) => it !== peerId)
    );
  });
  return trysteroRoom;
}

export function getTrysteroDocRoom(docId: string, roomId: string) {
  const key = getDocRoomId(docId, roomId);
  const model = trysteroDocRoomT(key, docId, roomId);
  return model as typeof model & TrysteroDocRoomModel;
}

function getDocRoomId(docId: string, roomId: string) {
  return `${docId}/${roomId}`;
}
