import { getDocLoadState } from '@/app/shared/store/doc-loader';
import { type DocSource } from '@blocksuite/sync';

export class StoreDocSource implements DocSource {
  constructor() {

  }
  name = 'StoreDocSource';
  
  
  async pull(docId: string, state: Uint8Array) {
    const $loader = getDocLoadState(docId);
    await $loader.load();
    return null
  }

  push(docId: string, data: Uint8Array) {
    
  }

  subscribe(
    _cb: (docId: string, data: Uint8Array) => void,
    _disconnect: (reason: string) => void
  ) {
    return () => {};
  }
  
}