import * as Y from "yjs";
import { getBaseShares } from "../shared/shares-base";

export function getMilkdownShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    prosemirror: ydoc.getXmlFragment('prosemirror')
  }
}