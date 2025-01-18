import * as Y from "yjs";
import { getBaseShares } from "../shared/config/shares-base";

export function getCodeMirrorShares(ydoc: Y.Doc) {
  return {
    ...getBaseShares(ydoc),    
    codemirror: ydoc.getText('codemirror')
  }
}