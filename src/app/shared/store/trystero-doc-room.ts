import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { TrysteroProvider } from "@/lib/yjs-trystero/y-trystero";
import {
  atom,
  map,
  onMount,
  type MapStore,
  type ReadableAtom,
} from "nanostores";
import type { Doc } from "yjs";
import { createRoom } from "../createRoom";
import { getDocRoomConfig, type DocRoomConfigFields } from "./doc-room-config";
import { getYdoc } from "./yjs-docs";
import { user } from "./local-user";
import { Awareness } from "y-protocols/awareness.js";
import { appId } from "./constants";

type ConnectionStatus = "connected" | "disconnected"
type SyncStatus = "synced" | "unsynced"
type LoadStatus = "loaded" | "loading" | "waiting" | "receiving" | "unloaded"
type PersistenceStatus = "persisted" | "unpersisted"


interface DocRoomState {
  needsPasswordToConnect?: boolean
  canConnect?: boolean
  provider?: TrysteroProvider
}

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

  const awareness = new Awareness(ydoc)

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


  onMount(store, () => {
    const unsubConfig = $config.subscribe((config, prevConfig) => {
      const needsPasswordToConnect = config.encrypt && !config.password;
      const canConnect = config.enabled && !needsPasswordToConnect; 
      const provider = canConnect ? createProvider(config) : undefined
      const unsubUser = user.subscribe((user) => {
        setUserInAwareness(user);
      });
      store.set({
        needsPasswordToConnect,
        canConnect,
        provider
      })
      return () => {
        unsubUser()
        // $syncState.set('unsynced')
        $connectionState.set('disconnected')
        $peerIds.set([])
        store.set({})
        provider?.destroy()
      }
    })
    return unsubConfig
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
        awareness.setLocalState(awareness.getLocalState());
        $connectionState.set('connected')
      }
    });  
    provider.on("synced", ({ synced }: { synced: boolean }) => {
      $syncState.set('synced')
      if (synced && !$loadState.get()) {
        $loadState.set('loaded')
        if (!ydoc.isLoaded) {
          ydoc.emit("load", []);
        }
      }
    });  
    provider.on("peers", ({ added, removed }:{removed: string[], added: string[]}) => {
      $peerIds.set( $peerIds.get().concat(added).filter((it) => !removed.includes(it)));
    })
    return provider
  }

  const model = Object.assign(store, {
    y: ydoc,
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
    )
);

export function getTrysteroDocRoom(docId: string, roomId: string) {
  return trysteroDocRoomT(getDocRoomId(docId, roomId), docId, roomId);
}

function getDocRoomId(docId: string, roomId: string) {
  return `${docId}/${roomId}`;
}
