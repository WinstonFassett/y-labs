import * as Y from "yjs";
import { getBaseShares } from "../shared/shares-base";

export function getCodeMirrorShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    codemirror: ydoc.getText('codemirror')
  }
}