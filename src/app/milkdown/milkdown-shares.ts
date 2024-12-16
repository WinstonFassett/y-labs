import * as Y from "yjs";
import { getBaseShares } from "../shared/shares-base";

export function getMilkdownShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    codemirror: ydoc.getXmlElement('milkdown')
  }
}