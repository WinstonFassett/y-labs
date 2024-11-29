import * as bc from "lib0/broadcastchannel";
import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import * as error from "lib0/error";
import * as logging from "lib0/logging";
import * as map from "lib0/map";
import * as math from "lib0/math";
import { createMutex } from "lib0/mutex";
import { ObservableV2 } from "lib0/observable";
import * as promise from "lib0/promise";
import * as random from "lib0/random";

import * as Y from "yjs";
import { selfId, type joinRoom as trysteroJoinRoom } from "trystero";

import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as cryptoutils from "./crypto.js";

type TrysteroJoinRoom = typeof trysteroJoinRoom
type TrysteroConfig = Parameters<TrysteroJoinRoom>[0];

const log = logging.createModuleLogger("y-trystero");

const messageSync = 0;
const messageQueryAwareness = 3;
const messageAwareness = 1;
const messageBcPeerId = 4;

export { selfId };
export const rooms = new Map<string, TrysteroDocRoom>();

export const getRoom = (roomId: string): TrysteroDocRoom | undefined => rooms.get(roomId);

const checkIsSynced = (room: TrysteroDocRoom): void => {
  let synced = true;
  room.trysteroConns.forEach((peer) => {
    if (!peer.synced) {
      synced = false;
    }
  });
  if ((!synced && room.synced) || (synced && !room.synced)) {
    room.synced = synced;
    room.provider.emit("synced", [{ synced }]);
    log("synced ", logging.BOLD, room.name, logging.UNBOLD, " with all peers");
  }
};

const readSyncMessage = (
  decoder: decoding.Decoder,
  encoder: encoding.Encoder,
  doc: Y.Doc,
  transactionOrigin: any,
  accessLevel: 'view' | 'edit'
): number => {
  const messageType = decoding.readVarUint(decoder);
  switch (messageType) {
    case syncProtocol.messageYjsSyncStep1:
      syncProtocol.readSyncStep1(decoder, encoder, doc);
      break;
    case syncProtocol.messageYjsSyncStep2:
      if (accessLevel !== 'edit') {
        console.warn('edit disabled', doc.guid);
        return messageType;
      }
      syncProtocol.readSyncStep2(decoder, doc, transactionOrigin);
      break;
    case syncProtocol.messageYjsUpdate:
      if (accessLevel !== 'edit') {
        console.warn('edit disabled', doc.guid, accessLevel);
        return messageType;
      }
      syncProtocol.readUpdate(decoder, doc, transactionOrigin);
      break;
    default:
      throw new Error('Unknown message type');
  }
  return messageType;
};

const readMessage = (
  room: TrysteroDocRoom,
  buf: Uint8Array,
  syncedCallback: () => void
): encoding.Encoder | null => {
  const decoder = decoding.createDecoder(buf);
  const encoder = encoding.createEncoder();
  const messageType = decoding.readVarUint(decoder);
  if (room === undefined) {
    return null;
  }
  const awareness = room.awareness;
  const doc = room.doc;
  let sendReply = false;
  switch (messageType) {
    case messageSync: {
      encoding.writeVarUint(encoder, messageSync);
      const syncMessageType = readSyncMessage(
        decoder,
        encoder,
        doc,
        room,
        room.provider.accessLevel
      );
      if (
        syncMessageType === syncProtocol.messageYjsSyncStep2 &&
        !room.synced
      ) {
        syncedCallback();
      }
      if (syncMessageType === syncProtocol.messageYjsSyncStep1) {
        sendReply = true;
      }
      break;
    }
    case messageQueryAwareness:
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          awareness,
          Array.from(awareness.getStates().keys())
        )
      );
      sendReply = true;
      break;
    case messageAwareness:
      awarenessProtocol.applyAwarenessUpdate(
        awareness,
        decoding.readVarUint8Array(decoder),
        room
      );
      break;
    case messageBcPeerId: {
      const add = decoding.readUint8(decoder) === 1;
      const peerName = decoding.readVarString(decoder);
      if (
        peerName !== room.peerId &&
        ((room.bcConns.has(peerName) && !add) ||
          (!room.bcConns.has(peerName) && add))
      ) {
        const removed: string[] = [];
        const added: string[] = [];
        if (add) {
          room.bcConns.add(peerName);
          added.push(peerName);
        } else {
          room.bcConns.delete(peerName);
          removed.push(peerName);
        }
        room.provider.emit("peers", [
          {
            added,
            removed,
            trysteroPeers: Array.from(room.trysteroConns.keys()),
            bcPeers: Array.from(room.bcConns),
          },
        ]);
        broadcastBcPeerId(room);
      }
      break;
    }
    default:
      console.error("Unable to compute message");
      return encoder;
  }
  if (!sendReply) {
    return null;
  }
  return encoder;
};

const readPeerMessage = (
  peerConn: TrysteroConn,
  buf: Uint8Array
): encoding.Encoder | null => {
  const room = peerConn.room;
  log(
    "received message from ",
    logging.BOLD,
    peerConn.remotePeerId,
    logging.GREY,
    " (",
    room.name,
    ")",
    logging.UNBOLD,
    logging.UNCOLOR
  );
  return readMessage(room, buf, () => {
    peerConn.synced = true;
    log(
      "synced ",
      logging.BOLD,
      room.name,
      logging.UNBOLD,
      " with ",
      logging.BOLD,
      peerConn.remotePeerId
    );
    checkIsSynced(room);
  });
};

const sendTrysteroConn = (
  trysteroConn: TrysteroConn,
  encoder: encoding.Encoder
): void => {
  log(
    "send message to ",
    logging.BOLD,
    trysteroConn.remotePeerId,
    logging.UNBOLD,
    logging.GREY,
    " (",
    trysteroConn.room.name,
    ")",
    logging.UNCOLOR
  );
  try {
    trysteroConn.room.provider.sendDocData(
      encoding.toUint8Array(encoder),
      trysteroConn.remotePeerId
    );
  } catch (e) {
    console.log("error sending", e);
  }
};

const broadcastTrysteroConn = (
  room: TrysteroDocRoom,
  m: Uint8Array
): void => {
  log("broadcast message in ", logging.BOLD, room.name, logging.UNBOLD);
  room.trysteroConns.forEach((conn) => {
    try {
      conn.room.provider.sendDocData(m);
    } catch (e) {
      console.log("error broadcasting", e);
    }
  });
};

export class TrysteroConn {
  remotePeerId: string;
  room: TrysteroDocRoom;
  closed: boolean;
  connected: boolean;
  synced: boolean;

  constructor(remotePeerId: string, room: TrysteroDocRoom) {
    log("connected to ", logging.BOLD, remotePeerId);
    this.room = room;
    this.remotePeerId = remotePeerId;
    this.closed = false;
    this.connected = false;
    this.synced = false;

    // already connected
    this.connected = true;
    // send sync step 1
    const provider = room.provider;
    const doc = provider.doc;
    const awareness = room.awareness;
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    sendTrysteroConn(this, encoder);
    const awarenessStates = awareness.getStates();
    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          awareness,
          Array.from(awarenessStates.keys()),
        ),
      );
      sendTrysteroConn(this, encoder);
    }
    room.provider.listenDocData((data: Uint8Array, peerId: string) => {
      try {
        const answer = readPeerMessage(this, data);
        if (answer !== null) {
          sendTrysteroConn(this, answer);
        }
      } catch (err) {
        console.log(err);
      }
    });
    room.provider.emit("peers", [
      {
        added: [remotePeerId],
        removed: [],
        resurrected: [],
        trysteroPeers: Array.from(room.trysteroConns.keys()),
        bcPeers: Array.from(room.bcConns),
      },
    ]);
  }

  onClose() {
    this.connected = false;
    this.closed = true;
    const { room, remotePeerId } = this;
    if (room.trysteroConns.has(remotePeerId)) {
      room.trysteroConns.delete(remotePeerId);
      room.provider.emit("peers", [
        {
          removed: [remotePeerId],
          added: [],
          trysteroPeers: Array.from(room.trysteroConns.keys()),
          bcPeers: Array.from(room.bcConns),
        },
      ]);
    }
    checkIsSynced(room);
    log("closed connection to ", logging.BOLD, remotePeerId);
  }

  destroy() {
    this.onClose();
  }
}


const broadcastBcMessage = (room: TrysteroDocRoom, m: Uint8Array) =>
  cryptoutils
    .encrypt(m, room.key)
    .then((data) => room.mux(() => bc.publish(room.name, data)));

const broadcastRoomMessage = (room: TrysteroDocRoom, m: Uint8Array) => {
  if (room.bcconnected) {
    broadcastBcMessage(room, m);
  }
  broadcastTrysteroConn(room, m);
};


const broadcastBcPeerId = (room: TrysteroDocRoom) => {
  if (room.provider.filterBcConns) {
    // broadcast peerId via broadcastchannel
    const encoderPeerIdBc = encoding.createEncoder();
    encoding.writeVarUint(encoderPeerIdBc, messageBcPeerId);
    encoding.writeUint8(encoderPeerIdBc, 1);
    encoding.writeVarString(encoderPeerIdBc, room.peerId);
    broadcastBcMessage(room, encoding.toUint8Array(encoderPeerIdBc));
  }
};

export class TrysteroDocRoom {
  peerId: string;
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  provider: TrysteroProvider;
  synced: boolean;
  name: string;
  key: CryptoKey | null;
  trysteroConns: Map<string, TrysteroConn>;
  bcConns: Set<string>;
  mux: ReturnType<typeof createMutex>;
  bcconnected: boolean;
  _bcSubscriber: (data: ArrayBuffer) => void;
  _docUpdateHandler: (update: Uint8Array, _origin: any) => void;
  _awarenessUpdateHandler: (changed: { added: any[]; updated: any[]; removed: any[] }, _origin: any) => void;
  _beforeUnloadHandler: () => void;

  constructor(doc: Y.Doc, provider: TrysteroProvider, name: string, key: CryptoKey | null) {
    this.peerId = selfId;
    this.doc = doc;
    this.awareness = provider.awareness;
    this.provider = provider;
    this.synced = false;
    this.name = name;
    this.key = key;
    this.trysteroConns = new Map();
    this.bcConns = new Set();
    this.mux = createMutex();
    this.bcconnected = false;

    this._bcSubscriber = (data: ArrayBuffer) =>
      cryptoutils.decrypt(new Uint8Array(data), key).then((m) =>
        this.mux(() => {
          const reply = readMessage(this, m, () => {});
          if (reply) {
            broadcastBcMessage(this, encoding.toUint8Array(reply));
          }
        }),
      );

    this._docUpdateHandler = (update: Uint8Array, _origin: any) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      broadcastRoomMessage(this, encoding.toUint8Array(encoder));
    };

    this._awarenessUpdateHandler = ({ added, updated, removed }: { added: any[]; updated: any[]; removed: any[] }, _origin: any) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoderAwareness = encoding.createEncoder();
      encoding.writeVarUint(encoderAwareness, messageAwareness);
      encoding.writeVarUint8Array(
        encoderAwareness,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients),
      );
      broadcastRoomMessage(this, encoding.toUint8Array(encoderAwareness));
    };

    this._beforeUnloadHandler = () => {
      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        [doc.clientID],
        "window unload",
      );
      rooms.forEach((room) => {
        room.disconnect();
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this._beforeUnloadHandler);
    } else if (typeof process !== "undefined") {
      process.on("exit", this._beforeUnloadHandler);
    }
  }

  async connect() {
    const roomName = this.name;

    // Bind to YJS model
    this.doc.on("update", this._docUpdateHandler);
    this.awareness.on("update", this._awarenessUpdateHandler);
        
    //#region Bind to Trystero Room
    const provider = this.provider;
    const trysteroRoom = provider.trystero;
    trysteroRoom.onPeerJoin((peerId: string) => {
      log(`${peerId} joined`);
      if (this.trysteroConns.size < provider.maxConns) {
        map.setIfUndefined(
          this.trysteroConns,
          peerId,
          () => new TrysteroConn(peerId, provider.room!),
        );
      }
    });
    trysteroRoom.onPeerLeave((peerId: string) => {
      log('leaving', { peerId, conns: this.trysteroConns.keys() });
      if (this.trysteroConns.has(peerId)) {
        const conn = this.trysteroConns.get(peerId);
        conn?.onClose();
        this.trysteroConns.delete(peerId);
        this.provider.emit("peers", [
          {
            removed: [peerId],
            added: [],
            trysteroPeers: Array.from(provider.room!.trysteroConns.keys()),
            bcPeers: Array.from(this.bcConns),
          },
        ]);
      }
      checkIsSynced(this);
      log("closed connection to ", logging.BOLD, peerId);
    });
    //#endregion

    //#region Sync over Broadcast Channel
    bc.subscribe(roomName, this._bcSubscriber);
    this.bcconnected = true;
    // // broadcast peerId via broadcastchannel
    broadcastBcPeerId(this);
    // write sync step 1
    const encoderSync = encoding.createEncoder();
    encoding.writeVarUint(encoderSync, messageSync);
    syncProtocol.writeSyncStep1(encoderSync, this.doc);
    broadcastBcMessage(this, encoding.toUint8Array(encoderSync));
    // broadcast local state
    const encoderState = encoding.createEncoder();
    encoding.writeVarUint(encoderState, messageSync);
    syncProtocol.writeSyncStep2(encoderState, this.doc);
    broadcastBcMessage(this, encoding.toUint8Array(encoderState));
    // write queryAwareness
    const encoderAwarenessQuery = encoding.createEncoder();
    encoding.writeVarUint(encoderAwarenessQuery, messageQueryAwareness);
    broadcastBcMessage(this, encoding.toUint8Array(encoderAwarenessQuery));
    // broadcast local awareness state
    const encoderAwarenessState = encoding.createEncoder();
    encoding.writeVarUint(encoderAwarenessState, messageAwareness);
    encoding.writeVarUint8Array(
      encoderAwarenessState,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID,
      ]),
    );
    broadcastBcMessage(this, encoding.toUint8Array(encoderAwarenessState));
    log("connected bc", this.name);
    //#endregion
  
    emitStatus(provider)
  }

  async reconnect() {
    await this.connect();
  }

  disconnect() {
    console.log('**trystero disconnect')
    this.awareness.setLocalState(null);
    this.provider.trystero?.leave();
    this.provider.trystero = null
    const encoderPeerIdBc = encoding.createEncoder();
    encoding.writeVarUint(encoderPeerIdBc, messageBcPeerId);
    encoding.writeUint8(encoderPeerIdBc, 0);
    encoding.writeVarString(encoderPeerIdBc, this.peerId);
    broadcastBcMessage(this, encoding.toUint8Array(encoderPeerIdBc));
    bc.unsubscribe(this.name, this._bcSubscriber);

    this.bcconnected = false;

    this.trysteroConns.forEach((conn) => conn.destroy());

    emitStatus(this.provider);
  }

  destroy() {
    this.doc.off("update", this._docUpdateHandler);
    this.awareness.off("update", this._awarenessUpdateHandler);

    this.disconnect();
    awarenessProtocol.removeAwarenessStates(
      this.awareness,
      [this.doc.clientID],
      "disconnect",
    );
    rooms.delete(this.name);

    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", this._beforeUnloadHandler);
    } else if (typeof process !== "undefined") {
      process.off("exit", this._beforeUnloadHandler);
    }
  }
}

const emitStatus = (provider: TrysteroProvider) => {
  provider.emit("status", [
    {
      connected: provider.connected,
    },
  ]);
};


function throwNotConnectedError (): any {
  throw error.create("You are not connected to the room");
}

interface TrysteroProviderEvents {
  status: (event: { connected: boolean }) => void;
  synced: (event: { synced: boolean }) => void;
  peers: (event: {
    added: string[];
    removed: string[];
    trysteroPeers: string[];
    bcPeers: string[];
  }) => void;
}

export class TrysteroProvider extends ObservableV2<TrysteroProviderEvents> {
  doc: Y.Doc;
  maxConns: number;
  filterBcConns: boolean;
  accessLevel: 'view' | 'edit';
  key: PromiseLike<CryptoKey | null>;
  trysteroConfig: TrysteroConfig;
  joinRoom: TrysteroJoinRoom
  room: TrysteroDocRoom | null;
  roomName: string;
  awareness: awarenessProtocol.Awareness;
  shouldConnect: boolean;
  trystero: any;
  sendDocData: (data: Uint8Array, peerId?: string) => void;
  listenDocData: (callback: (data: Uint8Array, peerId: string) => void) => void;

  constructor(
    doc: Y.Doc,
    roomName: string,
    joinRoom: TrysteroJoinRoom,
    trysteroConfig: TrysteroConfig,
    {
      accessLevel = "edit",
      password,
      awareness = new awarenessProtocol.Awareness(doc),
      maxConns = 20 + Math.floor(Math.random() * 15), // the random factor reduces the chance that n clients form a cluster
      filterBcConns = true
    }: {
      accessLevel?: 'view' | 'edit',
      password?: string,
      awareness?: awarenessProtocol.Awareness,
      maxConns?: number,
      filterBcConns?: boolean
    } = {},
  ) {
    super();
    this.doc = doc;
    this.maxConns = maxConns;
    this.filterBcConns = filterBcConns;
    this.accessLevel = accessLevel;
    this.key = password
      ? cryptoutils.deriveKey(password, roomName)
      : Promise.resolve(null);
    this.room = null;
    this.roomName = roomName;
    this.trysteroConfig = trysteroConfig
    this.joinRoom = joinRoom
    this.awareness = awareness;
    this.shouldConnect = false;
    this.sendDocData = throwNotConnectedError
    this.listenDocData = throwNotConnectedError
    doc.on("destroy", () => this.destroy());
    this.connect();
  }


  /**
   * Indicates whether the provider is looking for other peers.
   *
   * Other peers can be found via signaling servers or via broadcastchannel (cross browser-tab
   * communication). You never know when you are connected to all peers. You also don't know if
   * there are other peers. connected doesn't mean that you are connected to any physical peers
   * working on the same resource as you. It does not change unless you call provider.disconnect()
   *
   * `this.on('status', (event) => { console.log(event.connected) })`
   */
  get connected(): boolean {
    return this.room !== null && this.shouldConnect;
  }
  async connect(): Promise<TrysteroDocRoom> {
    this.shouldConnect = true;
    const trysteroRoom = this.trystero = this.joinRoom(this.trysteroConfig, this.roomName);
    const [sendDocData, listenDocData] = trysteroRoom.makeAction<Uint8Array>("docdata");
    this.sendDocData = sendDocData;
    this.listenDocData = listenDocData;
    
    // Reconnect
    const { doc, roomName } = this;
    if (rooms.has(roomName)) {
      const room = rooms.get(roomName);
      await room?.reconnect();
      return room!;
    }
    // Connect
    const provider = this
    const key = await this.key;
    const room = new TrysteroDocRoom(doc, provider, roomName, key);
    this.room = room;
    rooms.set(roomName, room);
    await room.connect();
    return room;
  }

  disconnect(): void {
    this.shouldConnect = false;
    if (this.room) {
      this.room.disconnect();
    }
  }

  destroy(): void {
    this.doc.off("destroy", this.destroy);
    // need to wait for key before deleting room
    this.key.then(() => {
      this.disconnect();
      this.room?.destroy();
      rooms.delete(this.roomName);
      super.destroy();
    });
  }
}
