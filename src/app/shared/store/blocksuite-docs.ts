import { createDefaultDocCollection, initDefaultDocCollection } from "@/app/blocksuite/default/utils/collection";
import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { AffineSchemas } from '@blocksuite/blocks';
import { Doc as BsDoc, DocCollection, Schema } from '@blocksuite/store';
import { atom, onMount, task } from "nanostores";


export const collection = createDefaultDocCollection();

export const CollectionReady = (
  (async () => {
    await initDefaultDocCollection(collection);
  })
)()

const blocksuiteDocsT = mapTemplate(
  (id) => atom<BsDoc>(),
  (store, id) => {
    
    
    const bsDoc = 
    // if doc exists in storage, load it
    collection.getDoc(id) ??
    // otherwise create it
      collection.createDoc({ id })

      const awareness = bsDoc.awarenessStore.awareness
    Object.assign(bsDoc.spaceDoc, {
      blocksuite: bsDoc,
      awareness,
    })
    store.set(bsDoc);  
    return () => {      
      bsDoc.dispose()
    }
  }
)

export function getBlocksuiteDocStore(id: string) {
  return blocksuiteDocsT(id);
}
