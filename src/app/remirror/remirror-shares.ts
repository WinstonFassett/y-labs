import * as Y from "yjs";
import { getBaseShares } from "../shared/shares-base";

export function getRemirrorShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    remirror: ydoc.getXmlElement('remirror')
  }
}