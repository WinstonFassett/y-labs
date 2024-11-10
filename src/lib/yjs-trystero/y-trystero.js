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
import { selfId } from "trystero";

import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as cryptoutils from "./crypto.js";

const log = logging.createModuleLogger("y-trystero");

const messageSync = 0;
const messageQueryAwareness = 3;
const messageAwareness = 1;
const messageBcPeerId = 4;

export { selfId };

/**
 * @type {Map<string,TrysteroDocRoom>}
 */
export const rooms = new Map();

export const getRoom = (roomId) => rooms.get(roomId);

/**
 * @param {TrysteroDocRoom} room
 */
const checkIsSynced = (room) => {
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

const readSyncMessage = (decoder, encoder, doc, transactionOrigin, access_level) => {syncProtocol;
  const messageType = decoding.readVarUint(decoder);
  switch (messageType) {
  case syncProtocol.messageYjsSyncStep1:
    syncProtocol.readSyncStep1(decoder, encoder, doc);
    break;
  case syncProtocol.messageYjsSyncStep2:
    if (access_level !== 'edit') {
      // console.warn('edit disabled', doc.name);
      return;
    }
    syncProtocol.readSyncStep2(decoder, doc, transactionOrigin);
    break;
  case syncProtocol.messageYjsUpdate:
    if (access_level !== 'edit') {
      // console.warn('edit disabled', doc.name);
      return;
    }
    syncProtocol.readUpdate(decoder, doc, transactionOrigin);
    break;
  default:
    throw new Error('Unknown message type');
  }
  return messageType;
};


/**
 * @param {TrysteroDocRoom} room
 * @param {Uint8Array} buf
 * @param {function} syncedCallback
 * @return {encoding.Encoder?}
 */
const readMessage = (room, buf, syncedCallback) => {
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
      // console.log('sync message', 'access level', room.provider.accessLevel)
      encoding.writeVarUint(encoder, messageSync);
      const syncMessageType = readSyncMessage(
        decoder,
        encoder,
        doc,
        room,
        room.provider.accessLevel,
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
          Array.from(awareness.getStates().keys()),
        ),
      );
      sendReply = true;
      break;
    case messageAwareness:
      awarenessProtocol.applyAwarenessUpdate(
        awareness,
        decoding.readVarUint8Array(decoder),
        room,
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
        const removed = [];
        const added = [];
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
    // nothing has been written, no answer created
    return null;
  }
  return encoder;
};

/**
 * @param {TrysteroConn} peerConn
 * @param {Uint8Array} buf
 * @return {encoding.Encoder?}
 */
const readPeerMessage = (peerConn, buf) => {
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
    logging.UNCOLOR,
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
      peerConn.remotePeerId,
    );
    checkIsSynced(room);
  });
};

/**
 * @param {TrysteroConn} trysteroConn
 * @param {encoding.Encoder} encoder
 */
const sendTrysteroConn = (trysteroConn, encoder) => {
  log(
    "send message to ",
    logging.BOLD,
    trysteroConn.remotePeerId,
    logging.UNBOLD,
    logging.GREY,
    " (",
    trysteroConn.room.name,
    ")",
    logging.UNCOLOR,
  );
  try {
    trysteroConn.room.provider.sendDocData(
      encoding.toUint8Array(encoder),
      trysteroConn.remotePeerId,
    );
  } catch (e) {
    console.log("error sending", e);
  }
};

/**
 * @param {TrysteroDocRoom} room
 * @param {Uint8Array} m
 */
const broadcastTrysteroConn = (room, m) => {
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
  /**
   * @param {SignalingConn} signalingConn
   * @param {boolean} initiator
   * @param {string} remotePeerId
   * @param {TrysteroDocRoom} room
   */
  constructor(remotePeerId, room) {
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
    room.provider.listenDocData((data, peerId) => {
      try {
        const answer = readPeerMessage(this, data);
        if (answer !== null) {
          sendTrysteroConn(this, answer);
        }
      } catch (err) {
        console.log(err);
      }
    });
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
    // console.log("todo: destroy conn(?)");
  }
}

/**
 * @param {TrysteroDocRoom} room
 * @param {Uint8Array} m
 */
const broadcastBcMessage = (room, m) =>
  cryptoutils
    .encrypt(m, room.key)
    .then((data) => room.mux(() => bc.publish(room.name, data)));

/**
 * @param {TrysteroDocRoom} room
 * @param {Uint8Array} m
 */
const broadcastRoomMessage = (room, m) => {
  if (room.bcconnected) {
    broadcastBcMessage(room, m);
  }
  broadcastTrysteroConn(room, m);
};

/**
 * @param {TrysteroDocRoom} room
 */
const broadcastBcPeerId = (room) => {
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
  /**
   * @param {Y.Doc} doc
   * @param {TrysteroProvider} provider
   * @param {string} name
   * @param {CryptoKey|null} key
   */
  constructor(doc, provider, name, key) {
    this.peerId = selfId;
    this.doc = doc;
    /**
     * @type {awarenessProtocol.Awareness}
     */
    this.awareness = provider.awareness;
    this.provider = provider;
    this.synced = false;
    this.name = name;
    // @todo make key secret by scoping
    this.key = key;
    /**
     * @type {Map<string, TrysteroConn>}
     */
    this.trysteroConns = new Map();
    /**
     * @type {Set<string>}
     */
    this.bcConns = new Set();
    this.mux = createMutex();
    this.bcconnected = false;
    /**
     * @param {ArrayBuffer} data
     */
    this._bcSubscriber = (data) =>
      cryptoutils.decrypt(new Uint8Array(data), key).then((m) =>
        this.mux(() => {
          const reply = readMessage(this, m, () => {});
          if (reply) {
            broadcastBcMessage(this, encoding.toUint8Array(reply));
          }
        }),
      );
    /**
     * Listens to Yjs updates and sends them to remote peers
     *
     * @param {Uint8Array} update
     * @param {any} _origin
     */
    this._docUpdateHandler = (update, _origin) => {
      // console.log('update', update, _origin);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      broadcastRoomMessage(this, encoding.toUint8Array(encoder));
    };
    /**
     * Listens to Awareness updates and sends them to remote peers
     *
     * @param {any} changed
     * @param {any} _origin
     */
    this._awarenessUpdateHandler = ({ added, updated, removed }, _origin) => {
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

    provider.trystero.onPeerJoin((peerId) => {
      log(`${peerId} joined`);
      if (this.trysteroConns.size < provider.maxConns) {
        map.setIfUndefined(
          this.trysteroConns,
          peerId,
          () => new TrysteroConn(peerId, provider.room),
        );
      }
    });
    provider.trystero.onPeerLeave((peerId) => {
      const conn = this.trysteroConns.get(peerId);
      conn.onClose();
      if (this.trysteroConns.has(peerId)) {
        this.trysteroConns.delete(peerId);
        this.provider.emit("peers", [
          {
            removed: [peerId],
            added: [],
            trysteroPeers: Array.from(provider.room.trysteroConns.keys()),
            bcPeers: Array.from(this.bcConns),
          },
        ]);
      }
      checkIsSynced(this);
      log("closed connection to ", logging.BOLD, peerId);
    });
  }

  connectToDoc() {
    this.doc.on("update", this._docUpdateHandler);
    this.awareness.on("update", this._awarenessUpdateHandler);
    const roomName = this.name;
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
    log("connected room to doc", this);
  }

  disconnect() {
    console.log("DISCONNECT", this);

    awarenessProtocol.removeAwarenessStates(
      this.awareness,
      [this.doc.clientID],
      "disconnect",
    );
    // broadcast peerId removal via broadcastchannel
    const encoderPeerIdBc = encoding.createEncoder();
    encoding.writeVarUint(encoderPeerIdBc, messageBcPeerId);
    encoding.writeUint8(encoderPeerIdBc, 0); // remove peerId from other bc peers
    encoding.writeVarString(encoderPeerIdBc, this.peerId);
    broadcastBcMessage(this, encoding.toUint8Array(encoderPeerIdBc));

    bc.unsubscribe(this.name, this._bcSubscriber);
    this.bcconnected = false;
    this.doc.off("update", this._docUpdateHandler);
    this.awareness.off("update", this._awarenessUpdateHandler);
    this.trysteroConns.forEach((conn) => conn.destroy());
  }

  destroy() {
    this.disconnect();
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", this._beforeUnloadHandler);
    } else if (typeof process !== "undefined") {
      process.off("exit", this._beforeUnloadHandler);
    }
  }
}

/**
 * @param {Y.Doc} doc
 * @param {TrysteroProvider} provider
 * @param {string} name
 * @param {CryptoKey|null} key
 * @return {TrysteroDocRoom}
 */
const openRoom = (doc, provider, name, key) => {
  // there must only be one room
  if (rooms.has(name)) {
    throw error.create(`A Yjs Doc connected to room "${name}" already exists!`);
  }
  const room = new TrysteroDocRoom(doc, provider, name, key);
  room.connectToDoc();
  rooms.set(name, /** @type {TrysteroDocRoom} */ (room));
  return room;
};

/**
 * @typedef {Object} ProviderOptions
 * @property {Array<string>} [signaling]
 * @property {string} [password]
 * @property {awarenessProtocol.Awareness} [awareness]
 * @property {number} [maxConns]
 * @property {boolean} [filterBcConns]
 * @property {any} [peerOpts]
 */

/**
 * @param {TrysteroProvider} provider
 */
const emitStatus = (provider) => {
  provider.emit("status", [
    {
      connected: provider.connected,
    },
  ]);
};

/**
 * @typedef {Object} TrysteroProviderEvents
 * @property {function({connected:boolean}):void} TrysteroProviderEvent.status
 * @property {function({synced:boolean}):void} TrysteroProviderEvent.synced
 * @property {function({added:Array<string>,removed:Array<string>,trysteroPeers:Array<string>,bcPeers:Array<string>}):void} TrysteroProviderEvent.peers
 */

export class TrysteroProvider extends ObservableV2 {
  /**
   * @class
   * @classdesc Represents a Y.Trystero instance.
   * @param {Y.Doc} doc - The Y.Doc instance.
   * @param {string} roomName - The name of the room.
   * @param {TrysteroRoom} trysteroRoom - The TrysteroRoom instance.
   * @param {Object} options - The options for the constructor.
   * @param {string} [options.password] - The password for encryption.
   * @param {Awareness} [options.awareness=new awarenessProtocol.Awareness(doc)] - The awareness instance.
   * @param {number} [options.maxConns=20 + Math.floor(Math.random() * 15)] - The maximum number of connections.
   * @param {boolean} [options.filterBcConns=true] - Whether to filter broadcast connections.
   * @param {'view' | 'edit'} [options.accessLevel="edit"] - The access level.
   */
  constructor(
    doc,
    roomName,
    trysteroRoom,
    {
      accessLevel = "edit",
      password,
      awareness = new awarenessProtocol.Awareness(doc),
      maxConns = 20 + math.floor(random.rand() * 15), // the random factor reduces the chance that n clients form a cluster
      filterBcConns = true
    } = {},
  ) {
    super();
    this.doc = doc;
    this.maxConns = maxConns;
    this.filterBcConns = filterBcConns;
    
    this.accessLevel = accessLevel;
    /**
     * @type {PromiseLike<CryptoKey | null>}
     */
    this.key = password
      ? cryptoutils.deriveKey(password, roomName)
      : /** @type {PromiseLike<null>} */ (promise.resolve(null));
    this.trystero = trysteroRoom;
    /**
     * @type {TrysteroDocRoom|null}
     */
    this.room = null;
    this.roomName = roomName;
    /**
     * @type {awarenessProtocol.Awareness}
     */
    this.awareness = awareness;
    this.key.then((key) => {
      this.room = openRoom(doc, this, roomName, key);
    });
    doc.on("destroy", () => this.destroy);
    // return;
    const [sendDocData, listenDocData] = trysteroRoom.makeAction("docdata");
    this.sendDocData = sendDocData;
    this.listenDocData = listenDocData;
  }
  connected() {
    log("connected to ", logging.BOLD, remotePeerId);
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
  }
  destroy() {
    this.doc.off("destroy", this.destroy);
    // need to wait for key before deleting room
    this.key.then(() => {
      /** @type {TrysteroDocRoom} */ (this.room)?.destroy();
      rooms.delete(this.roomName);
    });
    super.destroy();
  }
}
