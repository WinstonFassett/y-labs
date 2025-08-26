import * as Y from "yjs";
import { getBaseShares } from "../shared/config/shares-base";

export function getBlocksuiteShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    blocks: ydoc.getMap('blocks')
  }
}