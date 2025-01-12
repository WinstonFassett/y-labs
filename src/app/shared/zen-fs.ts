import { configureSingle, fs } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';

async function setup () {
  await configureSingle({ backend: IndexedDB });  
}

export const FsReady = setup()

Object.assign(window, { fs });

export { fs };
