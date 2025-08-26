import * as Y from "yjs";
import { getBaseShares } from "../shared/config/shares-base";

export function getRemirrorShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    remirror: ydoc.getXmlFragment('remirror')
  }
}