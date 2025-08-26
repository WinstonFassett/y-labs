import * as Y from "yjs";
import { getBaseShares } from "../shared/config/shares-base";

export function getNovelShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    novel: ydoc.getXmlFragment('novel'),
  }
}