import * as Y from "yjs";
import { getBaseShares } from "../shared/shares-base";

export function getNovelShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    novel: ydoc.getXmlFragment('novel'),
  }
}