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
import { createRoom } from "../createRoom";
import { appId } from "./constants";
import { getDocRoomConfig, type DocRoomConfigFields } from "./doc-room-config";
import { user } from "./local-user";
import { getYdoc } from "./yjs-docs";

import DataChannelStream from '@/lib/dcs'
import NotSecretStream from 'not-secret-stream'
import Protomux from 'protomux'
import { corestore } from "../corestore";
import crypto from 'hypercore-crypto'

type ConnectionStatus = "connected" | "disconnected"
type SyncStatus = "synced" | "unsynced"
type LoadStatus = "loaded" | "loading" | "waiting" | "receiving" | "unloaded"

interface DocRoomState {
  needsPasswordToConnect?: boolean
  canConnect?: boolean
  provider?: TrysteroProvider
}

function getDocRoomId(docId: string, roomId: string) {
  return `${docId}/${roomId}`;
}

export function getTrysteroDocRoom(docId: string, roomId: string) {
  return trysteroDocRoomT(getDocRoomId(docId, roomId), docId, roomId);
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
    const unsubUser = user.subscribe((user) => {
      setUserInAwareness(user);
    });
    

    const unsubConfig = $enabledSharingLink.subscribe(() => {
      const config = $config.get()

      const needsPasswordToConnect = config.encrypt && !config.password;
      const canConnect = config.enabled && !needsPasswordToConnect; 

      const prevProvider = store.get().provider      
      if (prevProvider) {
        prevProvider.destroy()
      }

      const provider = canConnect ? createProvider(config) : undefined
      if (prevProvider && provider) {
        console.warn('recreating provider')
      }
      if (provider) {
        setUserInAwareness(user.get());
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
    let initialized = false

    const initialize = () => {
      console.log('INTIALIZING PEER DATA')
      const peersById = new Map<string, TrysteroHypercoreReplicationPeer>();
      const room = provider.trystero
      room.onPeerJoin((peerId) => {
        console.log('🟢 Peer connected:', peerId);
        const peerConnections = room.getPeers();
        const peerConnection = peerConnections[peerId];
  
        if (!peerConnection) {
          throw new Error('No RTCPeerConnection found');
        }
        const trysteroPeer = new TrysteroHypercoreReplicationPeer(peerId, peerConnection);
        console.log('Peer initialized:', peerId, trysteroPeer);
      })
      provider.trystero.onPeerLeave((peerId) => {
  
        console.log('Peer destroyed:', peerId);
        const peer = peersById.get(peerId);
        if (peer) {
          peer.destroy();
          peersById.delete(peerId);
          console.log('Removed destroyed peer:', peerId);
        }
  
      })
              
      setUserInAwareness(user.get())
      $connectionState.set('connected')
      initialized = true
    }

    provider.on('status', ({ connected }: { connected: boolean }) => {
      if (connected && !initialized) {
        initialize()
      }
    });  
    provider.on("synced", ({ synced }: { synced: boolean }) => {
      $syncState.set('synced')
      if (synced && $loadState.get()!== 'loaded') {
        $loadState.set('loaded')
        if (!ydoc.isLoaded) {
          ydoc.emit("load", []);
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
    )
);



class TrysteroHypercoreReplicationPeer {
  constructor(peerId: string, peerConnection: RTCPeerConnection) {
    this.peerId = peerId
    this.peerConnection = peerConnection
    this.wss = new DataChannelStream(peerConnection.createDataChannel(
      'hypercore',
      {
        negotiated: true,
        id: 11
      }
    ))
    // this.wss = dataChannelToStream(peerConnection.createDataChannel('hypercore'))
    const keyPair = crypto.keyPair();
    this.framed = new NotSecretStream(this.wss, { keyPair })
    this.mux = Protomux.from(this.framed)
    // this.rpc = new JRPC(new RPC(this.mux))
    this.replication = corestore.replicate(this.mux)

    console.log('Replication started for peer:', peerId)

    this.replication.on('data', (data) => {
      console.log('Replication data received:', {data})
    })
    this.replication.on('error', (err) => {
      console.error('Replication error:', err)
    })
    this.replication.on('end', () => {
      console.log('Replication ended')
    })

    console.log('TrysteroPeer created', { peerId }, this)
  }
  destroy() {
    console.log
    (`this.replication.destroy()
    this.rpc.destroy()
    this.mux.destroy()
    this.framed.destroy()
    this.wss.destroy()`)
  }
}
