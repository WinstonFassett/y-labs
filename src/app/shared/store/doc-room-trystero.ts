import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { TrysteroProvider } from "@/lib/yjs-trystero/y-trystero";
import {
  atom,
  computed,
  map,
  onMount
} from "nanostores";
import { Awareness } from "y-protocols/awareness.js";
import type { Doc } from "yjs";
import { createRoom } from "../../../lib/trystero-room";
import { appId } from "./constants";
import { getDocRoomConfig, type DocRoomConfigFields } from "./doc-room-config";
import { $user } from "./local-user";
import { getYdoc } from "./doc-yjs";
import { nanoevent } from "@/lib/nanoevent";

type ConnectionStatus = "connected" | "disconnected"
type SyncStatus = "synced" | "unsynced"
type LoadStatus = "loaded" | "loading" | "waiting" | "receiving" | "unloaded"

interface DocRoomState {
  needsPasswordToConnect?: boolean
  canConnect?: boolean
  provider?: TrysteroProvider
}
// type DocRoom = ReturnType<typeof getTrysteroDocRoom>;

type RoomInfo = {
  docId: string 
  roomId: string
  $room: DocRoomStore
  provider: TrysteroProvider
}

const [emitJoinedTrysteroRoom, listenJoinedTrysteroRoom] = nanoevent<RoomInfo>()

const [emitLeftTrysteroRoom, listenLeftTrysteroRoom] = nanoevent<RoomInfo>()

export {
  listenJoinedTrysteroRoom,
  listenLeftTrysteroRoom
}

function getDocRoomId(docId: string, roomId: string) {
  return `${docId}/${roomId}`;
}

export function getTrysteroDocRoom(docId: string, roomId: string) {
  return trysteroDocRoomT(getDocRoomId(docId, roomId), docId, roomId);
}

export type DocRoomStore = ReturnType<typeof getTrysteroDocRoom>

function createTrysteroDocRoom(
  docId: string,
  ydoc: Doc,
  roomId: string,
) {
  const $config = getDocRoomConfig(docId, roomId);
  
  const store = map<DocRoomState>({
    needsPasswordToConnect: false,
    canConnect: false,
    provider: undefined
  })

  const $connectionState = atom<ConnectionStatus>('disconnected')
  const $syncState = atom<SyncStatus>('unsynced')
  const $loadState = atom<LoadStatus>('unloaded')
  const $peerIds = atom<string[]>([])
  const $enabledSharingLink = computed([$config], (config) => {
    return config.enabled ? $config.$sharingLink.get() : undefined
  })

  const awareness = (ydoc as { awareness?: Awareness }).awareness ?? new Awareness(ydoc)

  function setUserInAwareness(user: Readonly<{ username: string; color: string; }>) {
    awareness.setLocalState({
      user: {
        color: user.color,
        name: user.username, // for y codemirror
        username: user.username,
      },
    })
  }

  const $awarenessStates = atom(new Map());
  onMount($awarenessStates, () => {
    const onChange = () => {
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


  onMount(store, () => {
    const unsubUser = $user.subscribe((user) => {
      setUserInAwareness(user);
    });
    

    const unsubConfig = $enabledSharingLink.subscribe(() => {
      const config = $config.get()

      const needsPasswordToConnect = config.encrypt && !config.password;
      const canConnect = config.enabled && !needsPasswordToConnect; 

      const prevProvider = store.get().provider      
      if (prevProvider) {
        prevProvider.destroy()
        emitLeftTrysteroRoom({docId, roomId, $room: model, provider: prevProvider})
      }

      const provider = canConnect ? createProvider(config) : undefined
      if (prevProvider && provider) {
        console.warn('recreating provider')
      }
      if (provider) {
        setUserInAwareness($user.get());
      }
      store.set({
        needsPasswordToConnect,
        canConnect,
        provider
      })      
    })
    return () => {
      unsubConfig()
      unsubUser()
      store.value?.provider?.destroy()
    }
    
  })
  

  function createProvider(config: Readonly<DocRoomConfigFields>) {
    const { roomId, password, encrypt, accessLevel } = config;
    const provider = new TrysteroProvider(ydoc, roomId, createRoom, { appId: appId }, { 
      password, 
      accessLevel: config.accessLevel,
      awareness
    });
    provider.on('status', ({ connected }: { connected: boolean }) => {
      if (connected) {
        setUserInAwareness($user.get())
        $connectionState.set('connected')
        emitJoinedTrysteroRoom({ docId, roomId, $room: model, provider })
      }
    });  
    provider.on("synced", ({ synced }: { synced: boolean }) => {
      $syncState.set('synced')
      if (synced && $loadState.get()!== 'loaded') {
        $loadState.set('loaded')
        if (!ydoc.isLoaded) {
          ydoc.emit("load", [ydoc]);
        }
      }
    });  
    provider.on("peers", (e:{removed: string[], added: string[], resurrected: string[] }) => {
      const { added, removed, resurrected } = e;
      $peerIds.set( $peerIds.get().concat(added).concat(resurrected).filter((it) => !removed.includes(it)));
    })
    
    return provider
  }

  const model = Object.assign(store, {
    y: ydoc,
    awareness,
    $config,
    $awarenessStates,
    $connectionState,
    $syncState,
    $loadState,
    $peerIds
  });
  return model;
}

const trysteroDocRoomT = mapTemplate(
  (id, docId: string, roomId: string) =>
    createTrysteroDocRoom(
      docId,
      getYdoc(docId).get(),
      roomId,
    ),
  (store, id, docId, roomId) => {
    $allDocRooms.setKey(id, store);
    return () => {
      $allDocRooms.setKey(id, undefined as any);
    }
  }
);


export const $allDocRooms = map<Record<string, ReturnType<typeof getTrysteroDocRoom>>>({});

const $docRoomRegistry = atom<Record<string, ReturnType<typeof getTrysteroDocRoom>>>({})

