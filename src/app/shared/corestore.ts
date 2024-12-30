import b4a from 'b4a';
import Corestore from 'corestore';
import crypto from 'hypercore-crypto';
// import { createFile } from '@zacharygriffee/random-access-idb';
import { createLevelRandomAccessFileSystem } from '@/lib/level-random-access';
// import { BrowserLevel } from 'browser-level';
// import levelup from 'levelup';
// import memdown from 'memdown';
// just used for handshake (I think)
export const keyPair = crypto.keyPair();
export const keystr = b4a.toString(keyPair.publicKey, 'hex');

// const db = new BrowserLevel('example', { valueEncoding: 'json' })
// const db = levelup('memdb', {db:memdown})


// console.log('db', db)
const {fs, createFile} = createLevelRandomAccessFileSystem()
console.log('FS', {fs, createFile})

// window.fs = fs

export const corestore = new Corestore(name => {
  console.log('createFile', name)
  const file = createFile(name)
  console.log('file', file)
  return file
});


// async function setupRA() {
//   // Add an entry with key 'a' and value 1
//   await db.put('a', 1)

//   // Add multiple entries
//   await db.batch([{ type: 'put', key: 'b', value: 2 }])

//   // Get value of key 'a': 1
//   const value = await db.get('a')

//   // Iterate entries with keys that are greater than 'a'
//   for await (const [key, value] of db.iterator({ gt: 'a' })) {
//     console.log(value) // 2
//   }


//   console.log('OK!')
// }
// setupRA()