import { corestore } from '@/app/shared/corestore';
import { type BlobSource } from '@blocksuite/sync';
import { atom, computed } from 'nanostores';
import { selfId, type joinRoom as trysteroJoinRoom, type Room as TrysteroRoom } from "trystero";
import Hyperdrive from 'hyperdrive';
import serialize from 'json-sorted-stringify';
import { Readable, pipeline } from 'streamx'
import b4a from 'b4a';
import { mapTemplate } from '@/lib/nanostores-utils/mapTemplate';

//#region sample code for reference
/*
import { createStore, del, get, keys, set } from 'idb-keyval';

import type { BlobSource } from '../source.js';

export class IndexedDBBlobSource implements BlobSource {
  readonly mimeTypeStore = createStore(`${this.name}_blob_mime`, 'blob_mime');

  readonly = false;

  readonly store = createStore(`${this.name}_blob`, 'blob');

  constructor(readonly name: string) {}

  async delete(key: string) {
    await del(key, this.store);
    await del(key, this.mimeTypeStore);
  }

  async get(key: string) {
    const res = await get<ArrayBuffer>(key, this.store);
    if (res) {
      return new Blob([res], {
        type: await get(key, this.mimeTypeStore),
      });
    }
    return null;
  }

  async list() {
    const list = await keys<string>(this.store);
    return list;
  }

  async set(key: string, value: Blob) {
    await set(key, await value.arrayBuffer(), this.store);
    await set(key, value.type, this.mimeTypeStore);
    return key;
  }
}
*/
//#endregion

export const collabStore = corestore.namespace('collab');

export const $attachmentScope = atom<string | null>(null);

const $attachmentScopeStore = computed([$attachmentScope], (scope) => {
  if (scope === null) {
    return collabStore;
  }
  return collabStore.namespace(scope);
});

const attachmentDriveT = mapTemplate(
  (permalinkAsId) => {
    const stuff = parseHyperdrivePermalink(permalinkAsId);
    if (stuff === null) {
      throw new Error('Invalid attachment link');
    }
    const { key: driveKey, path, version, blob } = stuff;
    const attachmentStore = getCasStore(path);
    const drive = new Hyperdrive(attachmentStore, driveKey);
    return atom(drive);
  }
)

function getAttachmentDrive(permalinkAsId: string) {
  return attachmentDriveT(permalinkAsId).value;
} 

function setAttachmentDrive(permalinkAsId: string, drive: Hyperdrive) {
  attachmentDriveT.cache[permalinkAsId] = atom(drive);
}

// const $attachmentScopeDrive = computed([$attachmentScopeStore], (scopeStore) => {
//   return new Hyperdrive(scopeStore)
// })

function getStore(scope: string[]) {
  return scope.reduce((store, name) => {
    return store.namespace(name);
  }, collabStore);
}

async function getHyperdrivePermalink(drive: Hyperdrive, path: string) {
  const version = drive.version;
  const hypercore = drive.core;
  const entry = await drive.entry(path);
  console.log('entry', entry);
  const { blob } = entry.value;
  const blobKey = serialize(blob);
  console.log('blobKey', blobKey);
  const driveKey = b4a.toString(drive.key, 'hex');
  console.log('driveKey', driveKey);
  // const encodedBlobKey = Buffer.from(drive.key).toString('base64');
  return `hyper://${driveKey}${path}/v/${version}/${blobKey}`;
}

function parseHyperdrivePermalink(permalink: string) {
  const parts = permalink.split('//');
  if (parts.length !== 2) {
    return null;
  }
  const [protocol, rest] = parts;
  if (protocol !== 'hyper:') {
    return null;
  }
  const [key, path, _v, version, blobKey] = rest.split('/');
  const blob = JSON.parse(blobKey);
  const keyParsed = b4a.from(key, 'hex');
  return { key: keyParsed, path, version, blob };
}

const CAS_KEY = "cas";
function getCasStore(key: string) {
  return getStore([$attachmentScope.get() ?? "docs", CAS_KEY, key]);
}

async function writeBlobToHyperdrive(blob: Blob, drive: Hyperdrive, path:string) {
  await drive.ready();
  const readableStream = blob.stream(); // Get ReadableStream from Blob
  const writer = drive.createWriteStream(path); // Create Hyperdrive WritableStream
  const reader = readableStream.getReader(); // Get a reader for the ReadableStream

  try {
      while (true) {
          const { value, done } = await reader.read();
          if (done) break; // Exit when the stream is done
          writer.write(value); // Write each chunk to the Hyperdrive stream
      }
  } catch (error) {
      console.error("Error during streaming:", error);
  } finally {
      writer.end(); // Close the writable stream
      return new Promise<void>((resolve, reject) => {
        writer.once('finish', () => {
          console.log('write finished');
          resolve();
        });
        writer.once('error', (err) => {
          console.error('write error', err);
          reject(err);
        });
      })
      // wsonsole.log("Stream finished");
  }
}

async function writeBlobToHyperdriveR1(blob: Blob, hyperdrive: Hyperdrive, path: string) {
  await hyperdrive.ready();

  // const readable = new Readable({
  //   async read(size) {
  //     try {
  //       const { done, value } = await this.reader.read();
        
  //       if (done) {
  //         this.push(null); // Signal end of stream
  //       } else {
  //         this.push(value); // Push chunk
  //       }
  //     } catch (err) {
  //       this.destroy(err);
  //     }
  //   }
  // });

  // readable.reader = blob.stream().getReader();

  // const writable = hyperdrive.createWriteStream(path);

  // return new Promise<void>((resolve, reject) => {
  //   pipeline(
  //     readable,
  //     writable,
  //     (err) => {
  //       if (err) {
  //         console.error('Pipeline failed', err);
  //         reject(err);
  //       } else {
  //         console.log('Successfully wrote blob to hyperdrive');
  //         resolve();
  //       }
  //     }
  //   );
  // });
}

async function readBlobFromHyperdrive(hyperdrive: Hyperdrive, path: string): Promise<Blob> {
  console.log('reading', path, { hyperdrive })
  await hyperdrive.ready();
  const readable = hyperdrive.createReadStream(path);

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of readable) {
        console.log('chunk', chunk);
        controller.enqueue(chunk);
      }
      controller.close();
    }
  });
  const blob = new Response(stream).blob();
  console.log('blob', blob);
  return blob
}

export class HyperdriveBlobSource implements BlobSource {
  name: string;
  readonly: boolean;
  ready?: Promise<void>;
  constructor(name: string) {
    this.name = name;
    this.readonly = false;
  }
  async _init () {
    if (!this.ready) {      
      this.ready = collabStore.ready();
    }
    await this.ready
  }
  async set(key: string, value: Blob): Promise<string> {
    await this._init();
    const attachmentStore = getCasStore(key);
    const drive = new Hyperdrive(attachmentStore);
    const path = `/${key}`
    await writeBlobToHyperdrive(value, drive, path);
    const id = await getHyperdrivePermalink(drive, path);
    setAttachmentDrive(id, drive);
    console.log('saved', id, { value, drive, key});
    return id
  }
  async get(key: string): Promise<Blob | null> {
    console.log('GET', key);
    // ensure initialized
    await this._init();
    const stuff = parseHyperdrivePermalink(key);
    console.log('stuff', stuff);
    if (stuff === null) {
      return null;
    }
    console.log('retrieving')
    const { key: driveKey, path, version, blob } = stuff;
    // const drive = new Hyperdrive(driveKey);
    // need a corestore to pass to the drive
    // how do I get a corestore for the drive key?
    const attachmentStore = getCasStore(path);
    console.log('attachmentStore', attachmentStore);
    // const drive = new Hyperdrive(attachmentStore, driveKey);
    const drive = getAttachmentDrive(key);
    console.log('drive', drive);
    await drive.ready();
    console.log('drive ready');
    const blobs = await drive.getBlobs();
    console.log('blobs', blobs);
    return await readBlobFromHyperdrive(drive, path);    
  }
  async delete(key: string): Promise<void> {
    await this._init();
    const stuff = parseHyperdrivePermalink(key);
    if (stuff === null) {
      return;
    }
    const { key: driveKey, path, version, blob } = stuff;
    const drive = new Hyperdrive(driveKey);
    await drive.del(path);    
  }
  async list() {
    await this._init();    
    return [];    
  }
}

// type TrysteroJoinRoom = typeof trysteroJoinRoom
// type TrysteroConfig = Parameters<TrysteroJoinRoom>[0];

// export const $rooms = atom<TrysteroRoom[]>([]);


// export class CollabBlobSource implements BlobSource {
//   name: string;
//   readonly: boolean;  
//   constructor() {
//     this.name = 'CollabBlobSource';
//     this.readonly = true;
//   }
//   get(key: string): Promise<Blob | null> {
//     // dance
    
//     return tryGetFromRooms($rooms.get(), key);
//   }
//   set(key: string, value: Blob): Promise<string> {
//     return Promise.resolve('');
//   }
//   delete(key: string): Promise<void> {
//     return Promise.resolve();
//   }
//   list(): Promise<string[]> {
//     return Promise.resolve([]);
//   }
// }


// const GET_TIMEOUT_MS = 5000;

// type MessageType = 'want-have' | 'HAVE' | 'dont-have' | 'want-block' | 'block'

// type Message =
//   | { type: 'want-have'}
//   | { type:  'HAVE'}
//   | { type:  'dont-have'}
//   | { type:  'want-block'}
//   | { type:  'block'}


// function setupRoom (room: TrysteroRoom) {
//   const [sendMessage, listenMessage] = room.makeAction<Message>('blob')
//   return { sendMessage, listenMessage }
// }

// async function tryGetFromRooms(rooms: TrysteroRoom[], key: string): Promise<Blob | null> {
  /*
  Ok. So, we have a list of rooms. We need to find the room that has the key.
  We can do this by iterating over the rooms and calling get on each room.
  Well, actions are async and one-way. So, we need to send a request and allow time for reply

  We can do this by using Promise.all on an array of Promises.

  
  */
 
  // protocol steps
  // 1. send want-have
  // 2. wait for HAVE or dont-have
  // 3. if HAVE, send want-block
  // 4. wait for block
  // 5. return block

  // short circuits:
  // 


//   return null
// }


//  Bitswap Wire format
// message Message {
//   message Wantlist {
//     enum WantType {
//       Block = 0;
//       Have = 1;
//     }

//     message Entry {
//       bytes block = 1; // CID of the block
//       int32 priority = 2; // the priority (normalized). default to 1
//       bool cancel = 3; // whether this revokes an entry
//       WantType wantType = 4; // Note: defaults to enum 0, ie Block
//       bool sendDontHave = 5; // Note: defaults to false
//     }

//     repeated Entry entries = 1; // a list of wantlist entries
//     bool full = 2; // whether this is the full wantlist. default to false
//   }
//   message Block {
//     bytes prefix = 1; // CID prefix (all of the CID components except for the digest of the multihash)
//     bytes data = 2;
//   }

//   enum BlockPresenceType {
//     Have = 0;
//     DontHave = 1;
//   }
//   message BlockPresence {
//     bytes cid = 1;
//     BlockPresenceType type = 2;
//   }

//   Wantlist wantlist = 1;
//   repeated Block payload = 3;
//   repeated BlockPresence blockPresences = 4;
//   int32 pendingBytes = 5;
// }