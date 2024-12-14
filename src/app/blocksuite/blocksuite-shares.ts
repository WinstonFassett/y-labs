import * as Y from "yjs";
import { getBaseShares } from "../shared/shares-base";

export function getBlocksuiteShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    blocks: ydoc.getMap('blocks')
  }
}