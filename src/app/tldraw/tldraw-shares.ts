import * as Y from "yjs";
import { getBaseShares } from "../shared/config/shares-base";

export function getTlDrawShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    tldraw: ydoc.getArray('tldraw'),
    tldraw_meta: ydoc.getMap('tldraw_meta'),
  }
}