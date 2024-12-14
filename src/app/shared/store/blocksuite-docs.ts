import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { AffineSchemas } from '@blocksuite/blocks';
import { DocCollection, Schema, Doc as BsDoc } from '@blocksuite/store';
import { atom } from "nanostores";
// import { getYdoc, setYdoc } from "./yjs-docs";
import type { Doc } from "yjs";

export const schema = new Schema().register(AffineSchemas);
export const collection = new DocCollection({ schema });
console.log('collection', collection)
Object.assign(window, {
  collection
})
collection.meta.initialize();

const blocksuiteDocsT = mapTemplate(
  (id, init?: (doc: BsDoc) => void) => atom<BsDoc>(),
  (store, id) => {
    const bsDoc = collection.createDoc({ id })
    console.log('bsDoc', bsDoc)
    // init?.(bsDoc)
    ;(bsDoc.spaceDoc as any).blocksuite = bsDoc
    store.set(bsDoc);  
    return () => {      
      console.log('disposing blocksuite doc', bsDoc)
      bsDoc.dispose()
    }
  }
  // (store, id) => {
    // force use this as doc editor ydoc
    // const ydoc = getYdoc(id).value
    // const bsDoc = store.get()
    
    // console.log({ydoc, bsDoc})
    // setYdoc(id, bsDoc.spaceDoc);
    // if (ydoc) {
    //   return () => {
    //     setYdoc(id, ydoc)
    //   }
    // }
  // }
)
export function getBlocksuiteDocStore(id: string) {
  const blocksuiteDoc = blocksuiteDocsT(id);
  return blocksuiteDoc;
}
