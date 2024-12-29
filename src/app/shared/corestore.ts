import b4a from 'b4a';
import Corestore from 'corestore';
import crypto from 'hypercore-crypto';
import { createFile } from '@zacharygriffee/random-access-idb';

// just used for handshake (I think)
export const keyPair = crypto.keyPair();
export const keystr = b4a.toString(keyPair.publicKey, 'hex');

export const corestore = new Corestore(createFile);
