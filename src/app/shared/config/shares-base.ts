import * as Y from "yjs";

export function getBaseShares(ydoc: Y.Doc) {
  return {
    meta: ydoc.getMap('meta'),
  }
}