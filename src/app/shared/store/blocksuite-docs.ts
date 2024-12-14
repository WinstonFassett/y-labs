import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { AffineSchemas } from '@blocksuite/blocks';
import { Doc as BsDoc, DocCollection, Schema } from '@blocksuite/store';
import { atom } from "nanostores";

export const schema = new Schema().register(AffineSchemas);

export const collection = new DocCollection({ schema });
collection.meta.initialize();

const blocksuiteDocsT = mapTemplate(
  (id) => atom<BsDoc>(),
  (store, id) => {
    const bsDoc = collection.createDoc({ id })
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
