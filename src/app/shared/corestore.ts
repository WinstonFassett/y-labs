import b4a from 'b4a';
import Corestore from 'corestore';
import crypto from 'hypercore-crypto';
import { createFile } from '@zacharygriffee/random-access-idb';

// just used for handshake (I think)
export const keyPair = crypto.keyPair();
export const keystr = b4a.toString(keyPair.publicKey, 'hex');

// const createFile = RAI('corestore')

export const corestore = new Corestore((filename: string) => {
  console.log(`Creating storage for ${filename}`);
  return createFile(filename, { chunkSize: 1024 });  
});
