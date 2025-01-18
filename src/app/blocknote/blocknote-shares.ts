import * as Y from "yjs";
import { getBaseShares } from "../shared/config/shares-base";

export function getBlocknoteShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    blocknote: ydoc.getXmlFragment('blocknote'),
  }
}