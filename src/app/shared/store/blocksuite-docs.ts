import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { AffineSchemas } from '@blocksuite/blocks';
import { DocCollection, Schema } from '@blocksuite/store';
import { atom } from "nanostores";
// import { getYdoc, setYdoc } from "./yjs-docs";
import type { Doc } from "yjs";

export const schema = new Schema().register(AffineSchemas);
export const collection = new DocCollection({ schema });

collection.meta.initialize();

const blocksuiteDocsT = mapTemplate(
  id => atom(collection.createDoc({ id })),
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
export function getBlocksuiteDoc(id: string) {
  const blocksuiteDoc = blocksuiteDocsT(id);
  return blocksuiteDoc;
}
