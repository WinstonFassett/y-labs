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
import { getDocRoomConfig, type DocRoomConfigFields } from "./doc-room-config";
import { getYdoc } from "./yjs-docs";
import { user } from "./local-user";
import { Awareness } from "y-protocols/awareness.js";

interface TrysteroDocRoomProps {
  y: Doc;
  room: Room;
}

interface TrysteroDocRoom extends TrysteroDocRoomProps {
  peerId: string;
  room: Room;
  provider: TrysteroProvider;
  disconnect: () => void;
  $awarenessStates: ReadableAtom<Map<number, any>>;
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
  docId: string,
  ydoc: Doc,
  roomId: string,
  config: DocRoomConfigFields,
  store = map({
    loaded: false,
    synced: false,
    provider: undefined
  } as OnlineDocRoomFields & { provider?: TrysteroProvider }),
) {
  const $config = getDocRoomConfig(docId, roomId);

  store.setKey("peerIds", [] as string[]);

  const awareness = new Awareness(ydoc)

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
      let states = awareness.getStates();
      // force new map for react because state changed
      if (states === $awarenessStates.get()) {
        states = new Map(states);
      }
      $awarenessStates.set(states);
    };
    awareness.on("change", onChange);
    return () => {
      awareness.off("change", onChange);
    };
  });

  const peerId = selfId;

  onMount(store, () => {
    const unsubConfig = $config.subscribe((config, prevConfig) => {
      const needsPasswordToConnect = config.encrypt && !config.password;
      const canConnect = config.enabled && !needsPasswordToConnect; 
      const { roomId, password, accessLevel } = config;

      const provider = canConnect ? createProvider(config) : undefined
      // if (provider && (provider.room as any)?.leftAt) {
      //   reconnect()
      // }
      return () => {
        provider?.destroy()
      }
    })
    return unsubConfig
  })
  
  const unsubUser = user.subscribe((user) => {
    setUserInAwareness(user);
  });



  function createProvider(config: Readonly<DocRoomConfigFields>) {
    const { roomId, password, encrypt, accessLevel } = config;
    const trysteroRoom = createTrysteroRoomForStore(roomId, config, store);
    const provider = new TrysteroProvider(ydoc, roomId, trysteroRoom, { password, accessLevel: config.accessLevel });
    provider.on('status', ({ connected }: { connected: boolean }) => {
      if (connected) {
        awareness.setLocalState(awareness.getLocalState());
      }
    });  
    provider.on("synced", ({ synced }: { synced: boolean }) => {
      store.setKey("synced", synced);
      if (synced && !store.get().loaded) {
        store.setKey("loaded", true);
        if (!ydoc.isLoaded) {
          ydoc.emit("load", []);
        }
      }
    });  
    provider.on("peers", ({ added, removed }:{removed: string[], added: string[]}) => {
      store.setKey("peerIds", store.get().peerIds.concat(added).filter((it) => !removed.includes(it)));
    })
    return provider
  }

  function setUserInAwareness(user: Readonly<{ username: string; color: string; }>) {
    awareness.setLocalState({
      user: {
        color: user.color,
        name: user.username, // for y codemirror
        username: user.username,
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
    const trysteroRoom = createTrysteroRoomForStore(roomId, config, store)
    await provider.connect(trysteroRoom)
    setUserInAwareness(user.get());
  }
  
  const model = Object.assign(store, {
    y: ydoc,
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
      docId,
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

function createTrysteroRoomForStore(roomId: string, config: DocRoomConfigFields, store: MapStore<OnlineDocRoomFields>) {
  const encryptAwareRoomId = `${roomId}${config.encrypt ? "-enc" : ""}`;
  const trysteroRoom = createRoom(encryptAwareRoomId);
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
