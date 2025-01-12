import { createDefaultDocCollection, initDefaultDocCollection } from "@/app/blocksuite/default/utils/collection";
import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { AffineSchemas } from '@blocksuite/blocks';
import { Doc as BsDoc, DocCollection, Schema } from '@blocksuite/store';
import { atom } from "nanostores";

// export const schema = new Schema().register(AffineSchemas);

// export const collection = new DocCollection({ schema });
// collection.meta.initialize();
export const collection = await createDefaultDocCollection();
  await initDefaultDocCollection(collection);
  

const blocksuiteDocsT = mapTemplate(
  (id) => atom<BsDoc>(),
  // OH. This is not allowed to fail. Must handle errors here.
  (store, id) => {
    console.log('creating bsDoc', id)
    // if doc exists in storage, load it
    
    // otherwise create it
    
    const bsDoc = 
      collection.getDoc(id) ??
      collection.createDoc({ id })
    console.log('bsDoc', bsDoc)
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
