import b4a from 'b4a';
import Corestore from 'corestore';
import crypto from 'hypercore-crypto';

// just used for handshake (I think)
export const keyPair = crypto.keyPair();
export const keystr = b4a.toString(keyPair.publicKey, 'hex');
