import { type BlobSource } from '@blocksuite/sync';
import type * as Y from 'yjs';


type BlobSourceOptions = {
  name?: string;
  readonly?: boolean;
  
}

type BlobKey = string;
type BlobBinary = ArrayBuffer | ArrayBufferView | Blob | string;

interface BlobInfo {}

// export interface BlobSource {
//   name: string;
//   readonly: boolean;
//   get: (key: string) => Promise<Blob | null>;
//   set: (key: string, value: Blob) => Promise<string>;
//   delete: (key: string) => Promise<void>;
//   list: () => Promise<string[]>;
// }

const YjsBlobMetaShareKey = 'blob-meta';
const YjsBlobShareKey = 'blobs';

function getYjsBlobShares (doc: Y.Doc) {
  const blobMetas = doc.getMap<BlobInfo>(YjsBlobMetaShareKey);
  const blobs = doc.getMap<BlobBinary>(YjsBlobShareKey);
  return { blobMetas, blobs } as const;
}



// export class YjsBlobSource implements BlobSource {
//   name: string;
//   readonly: boolean;
//   private doc: Y.Doc;
//   private yBlobs: Y.Map<BlobInfo>;
//   constructor(doc: Y.Doc, { name }: { name: string} ) {
//     this.name = name
//     this.doc = doc
//     this.readonly = false
//     const { blobs, blobMetas } = getYjsBlobShares(doc)
//     this.yBlobs = blobMetas

//   }

// }


export class P2PBlobSource implements BlobSource {
  name: string;
  readonly: boolean;
  wantList: Set<BlobKey>
  haveCache: Map<BlobKey, BlobInfo>
}

interface BaseMessage { [key: string]: any, type: string }
interface BlobMessage extends BaseMessage {
  
  key: BlobKey;
}
interface WantHaveMessage extends BlobMessage {}
interface HaveMessage extends BlobMessage {}
interface DontHaveMessage extends BlobMessage {}
interface WantBlockMessage extends BlobMessage {}
interface BlockMessage extends BlobMessage {}

type Message = WantHaveMessage | HaveMessage | DontHaveMessage | WantBlockMessage | BlockMessage;



export class TrysteroRoomsBlobSource implements BlobSource {
  name: string;
  readonly: boolean;
  private room: TrysteroRoom; // Room for peer-to-peer communication
  private localBlobSource: BlobSource; // Local (IDB) BlobSource
  private activeTransfers: Map<string, boolean>; // Track transfers in progress
  private wantList: Set<string>; // Track which blobs we need to download
  private haveList: Set<string>; // Track blobs we already have

  constructor(room: TrysteroRoom, localBlobSource: BlobSource, name: string, readonly = false) {
    this.room = room;
    this.localBlobSource = localBlobSource;
    this.name = name;
    this.readonly = readonly;
    this.activeTransfers = new Map();
    this.wantList = new Set();
    this.haveList = new Set();
    
    // Listen for peer events (joining/leaving)
    this.room.onPeerJoin(this.onPeerJoin.bind(this));
    this.room.onPeerLeave(this.onPeerLeave.bind(this));
    
    // Start listening for blob sync requests from peers
    this.room.listenMessage<{ action: string; key: string; blob?: Blob }>(
      'requestBlob',
      this.handleRequestBlob.bind(this)
    );
    this.room.listenMessage<{ action: string; key: string; blob: Blob }>(
      'sendBlob',
      this.handleSendBlob.bind(this)
    );
  }

  // Handle new peer joining
  private onPeerJoin(peerId: string) {
    console.log(`Peer joined: ${peerId}`);
    this.checkWantsList();
  }

  // Handle peer leaving
  private onPeerLeave(peerId: string) {
    console.log(`Peer left: ${peerId}`);
    // You could do additional cleanup here, e.g., stop transfers or recheck the wants list
  }

  // Get a blob (either from local storage or remote peers)
  async get(key: string): Promise<Blob | null> {
    // Check if the blob is already available locally (IDB)
    const localBlob = await this.localBlobSource.get(key);
    if (localBlob) {
      return localBlob;
    }

    // If not, mark it as wanted and try to fetch from peers
    this.wantList.add(key);
    await this.checkWantsList();
    return null;
  }

  // Check the wants list and request blobs from peers
  private async checkWantsList() {
    // If there are blobs we want and haven't requested yet, start requesting
    for (const key of this.wantList) {
      if (this.activeTransfers.get(key)) continue; // If already transferring, skip

      // Get peers who might have the blob
      const peers = this.room.getPeers();
      const peerIds = Object.keys(peers);

      for (const peerId of peerIds) {
        this.activeTransfers.set(key, true);
        console.log(`Requesting ${key} from peer ${peerId}`);
        
        // Send a message requesting the blob from the peer
        try {
          await this.room.sendMessage<{ action: string; key: string }>(
            'requestBlob', 
            { action: 'requestBlob', key },
            [peerId] // Send to the specific peer
          );
        } catch (err) {
          console.error(`Error requesting blob ${key} from peer ${peerId}:`, err);
        }
      }
    }
  }

  // Handle receiving a request for a blob (incoming request from peer)
  private async handleRequestBlob(
    payload: { action: string; key: string },
    peerId: string
  ) {
    const { key } = payload;
    console.log(`Peer ${peerId} requests blob ${key}`);

    // Check if we have the blob locally, if so, send it back
    const localBlob = await this.localBlobSource.get(key);
    if (localBlob) {
      console.log(`Sending blob ${key} to peer ${peerId}`);
      await this.room.sendMessage<{ action: string; key: string; blob: Blob }>(
        'sendBlob',
        { action: 'sendBlob', key, blob: localBlob },
        [peerId]
      );
    } else {
      console.log(`We don't have blob ${key} locally, ignoring request.`);
    }
  }

  // Handle receiving a blob from a peer (downloaded blob)
  private async handleSendBlob(
    payload: { action: string; key: string; blob: Blob },
    peerId: string
  ) {
    const { key, blob } = payload;
    console.log(`Received blob ${key} from peer ${peerId}`);
    
    // Store the blob locally
    await this.localBlobSource.set(key, blob);
    this.wantList.delete(key); // Remove from the want list as it's now available
    this.haveList.add(key); // Add to have list
  }

  // Set a blob (store it locally and send it to peers)
  async set(key: string, value: Blob): Promise<string> {
    // Store the blob locally
    const localKey = await this.localBlobSource.set(key, value);

    // If the blob is set locally, send it to peers
    const peers = this.room.getPeers();
    const peerIds = Object.keys(peers);
    for (const peerId of peerIds) {
      try {
        console.log(`Sending blob ${key} to peer ${peerId}`);
        await this.room.sendMessage<{ action: string; key: string; blob: Blob }>(
          'sendBlob',
          { action: 'sendBlob', key, blob: value },
          [peerId]
        );
      } catch (err) {
        console.error(`Error sending blob ${key} to peer ${peerId}:`, err);
      }
    }

    return localKey;
  }

  // List all keys (used for diagnostics or checking available blobs)
  async list(): Promise<string[]> {
    return this.localBlobSource.list();
  }
}


// clean slate

function syncBlobs (options: {}) {
  const log = console.log.bind(console)
  log('starting syncBlobs')

  // listen for protocol messages
  
  // process want queue

  return () => {
    log('unbinding syncBlobs')
  }
}

function createP2PBlobSource(options: BlobSourceOptions = {}): BlobSource {
  const { getBlob, setBlob} = createMultiSourceBlobSyncSession()

  const blobSource: BlobSource = {
    name: '',
    readonly: false,
    get: getBlob,
    set: (key, value) => {
      throw new Error('Function not implemented.');
    },
    delete: function (key: string): Promise<void> {
      throw new Error('Function not implemented.');
    },
    list: function (): Promise<string[]> {
      throw new Error('Function not implemented.');
    }
  }
  return blobSource
}



function createMultiSourceBlobSyncSession () {
  async function getBlobs (keys: string[]) {
    return keys.map(key => {
      return new Blob()
    })
  }
  const getBlob = async (key: string) => (await getBlobs([key]))[0]
  const setBlob = async (key: string, blob: Blob) => {
    return key
  }
  function destroy () {}
  return { getBlobs, getBlob, setBlob, destroy }
}


function createPeerBlobSyncTransport (peerConnection: RTCPeerConnection) {
  
}