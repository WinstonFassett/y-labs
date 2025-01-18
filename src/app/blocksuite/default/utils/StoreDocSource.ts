import { getDocLoadState } from '@/app/shared/store/doc-loader';
import { type DocSource } from '@blocksuite/sync';

export class StoreDocSource implements DocSource {
  constructor() {

  }
  name = 'StoreDocSource';
  
  
  async pull(docId: string, state: Uint8Array) {
    const $loader = getDocLoadState(docId);
    console.log('pulling', docId, { $loader})
        
    await ($loader as any).load(); 
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