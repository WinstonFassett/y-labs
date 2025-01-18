import type { BlobSource } from "@blocksuite/sync";
import { P2PBlobBroker } from "./trystero-p2p-blob-broker";
import { localBlobSource } from "./blocksuite-docs";



export function createDocRoomsBlobSource(docId: string) {
  const broker = new P2PBlobBroker(
    // {
    //   name: `doc-${docId}-blob-source`,
    //   readonly: true,
    //   get: async () => null, // Base source has no blobs
    //   set: async () => { throw new Error("Read only") },
    //   delete: async () => { throw new Error("Read only") },
    //   list: async () => []
    // }, 
    localBlobSource,
    docId
  );

  async function get(key: string) {
    try {
      return await broker.getBlob(key);
    } catch (err) {
      console.warn('Failed to get blob:', err);
      return null;
    }
  }

  const source: BlobSource & { destroy: () => void } = {
    name: `doc-${docId}-rooms`,
    readonly: true,
    get,
    set: async () => { throw new Error("Read only") },
    delete: async () => { throw new Error("Read only") },
    list: async () => [],
    destroy: () => {
      broker.destroy();
    }
  };

  return source;
}