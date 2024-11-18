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
  console.log('create doc room', {
    docRoomId,
    y,
    roomId,
    config,
    store
  })
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
      console.log('awareness change', {added, updated, removed});
      const states = provider.awareness.getStates();
      console.log('awareness states', states);
      $awarenessStates.set(states);
    };
    provider.awareness.on("change", onChange);
    return () => {
      provider.awareness.off("change", onChange);
    };
  });

  const peerId = selfId;

  console.log('creating trysteroRoom')
  
  const trysteroRoom = createRoomForStore(roomId, store);

  const password = config.encrypt ? config.password : undefined;
  
  const provider = new TrysteroProvider(y, roomId, trysteroRoom, { password, accessLevel: config.accessLevel });
  
  const unsubUser = user.subscribe((user) => {
    provider.awareness.setLocalStateField("user", {
      color: user.color,
      name: user.username, // for y codemirror
      userName: user.username, // for tiptap, blocknote
    });
  });

  provider.on("synced", ({ synced }: { synced: boolean }) => {
    console.log("sync state", synced);
    store.setKey("synced", synced);
    if (synced && !store.get().loaded) {
      store.setKey("loaded", true);
      if (!y.isLoaded) {
        y.emit("load", []);
      }
    }
  });

  provider.on("peers", ({ added, removed }:{removed: string[], added: string[]}) => {
    console.log('peers', { added, removed});
    store.setKey("peerIds", store.get().peerIds.concat(added).filter((it) => !removed.includes(it)));
  })

  function disconnect() {
    console.log('disconnect doc room')
    unsubUser();
    const { provider, room } = model;
    // trystero rooms cannot be rejoined
    provider.room?.disconnect()
    
    
    $awarenessStates.set(new Map());
    (trysteroRoom as any).leftAt = new Date();
    console.log("left", trysteroRoom);

    // provider.destroy();
    store.setKey("peerIds", []);

    // delete from cache
    // console.log('evicting', docRoomId, trysteroDocRoomT);
    // (trysteroDocRoomT as any).evict(docRoomId);
    // roomConfigsByDocId.setKey(docRoomId, undefined as any);
  }

  function reconnect () {
    console.log("RECONNECT")
    const trysteroRoom = createRoomForStore(roomId, store)
    provider.connectTrystero(trysteroRoom)
  }
  // ooof ok 
  // provider depends on enablement
  // when we disable, provider gets destroyed
  // so provider needs to be state
  // awareness states depends on provider
  // room also changes on disconnect
  // so we need to destroy the provider and room and awareness states
  // or can we just destroy the whole doc room?
  const model = Object.assign(store, {
    y,
    peerId,
    disconnect,
    reconnect,
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
    console.log('new doc room template', docRoomKey)
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

function createRoomForStore(roomId: string, store: MapStore<OnlineDocRoomFields>) {
  const trysteroRoom = createRoom(roomId);
  trysteroRoom.onPeerJoin((peerId) => {
    console.log("peer join", peerId);
    store.setKey("peerIds", store.get().peerIds.concat(peerId));
  });
  trysteroRoom.onPeerLeave((peerId) => {
    console.log("peer leave", peerId);
    store.setKey(
      "peerIds",
      store.get().peerIds.filter((it) => it !== peerId)
    );
  });
  return trysteroRoom;
}

export function getTrysteroDocRoom(docId: string, roomId: string) {
  const key = getDocRoomId(docId, roomId);
  console.log('get trystero doc room', key)
  const model = trysteroDocRoomT(key, docId, roomId);
  console.log('got trystero doc room', model)
  return model as typeof model & TrysteroDocRoomModel;
}

function getDocRoomId(docId: string, roomId: string) {
  return `${docId}/${roomId}`;
}
