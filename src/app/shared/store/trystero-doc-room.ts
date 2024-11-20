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
  // console.log('create doc room', {
  //   docRoomId,
  //   y,
  //   roomId,
  //   config,
  //   store
  // })
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

  
  const trysteroRoom = createTrysteroRoomForStore(roomId, store);

  const password = config.encrypt ? config.password : undefined;
  
  const provider = new TrysteroProvider(y, roomId, trysteroRoom, { password, accessLevel: config.accessLevel });
  
  const unsubUser = user.subscribe((user) => {
    setUserInAwareness(user);
  });

  provider.on('status', ({ connected }: { connected: boolean }) => {
    console.log('status connected?', connected)
    if (connected) {
      provider.awareness.setLocalState(provider.awareness.getLocalState());
    }
  });

  provider.on("synced", ({ synced }: { synced: boolean }) => {
    // console.log("sync state", synced);
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
    console.log('peerIds', store.get().peerIds)
  })

  function setUserInAwareness(user: Readonly<{ username: string; color: string; }>) {
    // provider.awareness.setLocalStateField("user", {
    //   color: user.color,
    //   name: user.username, // for y codemirror
    //   userName: user.username,
    // });
    provider.awareness.setLocalState({
      user: {
        color: user.color,
        name: user.username, // for y codemirror
        userName: user.username,
      },
    })
  }

  function disconnect() {
    console.log('disconnect doc room')
    // unsubUser();
    const { provider, room } = model;
        
    provider.room?.disconnect()
    
    // $awarenessStates.set(new Map())

    ;(trysteroRoom as any).leftAt = new Date();
    // console.log("left", trysteroRoom);
    store.setKey("peerIds", []);

  }

  function destroy () {
    disconnect();
    unsubUser();
  }

  async function reconnect () {
    // console.log("RECONNECT")
    const u = user.get();
    console.log('updating presence', u)
    setUserInAwareness(u);
    const trysteroRoom = createTrysteroRoomForStore(roomId, store)
    await provider.connectTrystero(trysteroRoom)
    // provider.awareness.setLocalStateField("user", {
    //   color: u.color,
    //   name: u.username, // for y codemirror
    //   userName: u.username, // for tiptap, blocknote
    // });
  }
  
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
    // console.log('new doc room template', docRoomKey)
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
  // console.log('creating trysteroRoom')
  const trysteroRoom = createRoom(roomId);
  trysteroRoom.onPeerJoin((peerId) => {
    console.log("peer join", peerId);
    store.setKey("peerIds", store.get().peerIds.concat(peerId));
    console.log('peerIds', store.get().peerIds)
  });
  trysteroRoom.onPeerLeave((peerId) => {
    console.log("peer leave", peerId);
    store.setKey(
      "peerIds",
      store.get().peerIds.filter((it) => it !== peerId)
    );
    console.log('peerIds', store.get().peerIds)
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
