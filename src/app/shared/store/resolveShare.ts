import * as Y from "yjs";
import { getBlocksuiteShares } from "@/app/blocksuite/blocksuite-shares";
export function resolveShare(ydoc: Y.Doc, name: string) {
  switch (name) {
    case "blocksuite": 
      return getBlocksuiteShares(ydoc).blocks
    case "tldraw":
      return ydoc.getArray(name);
    case "novel":
    case "blocknote":
      return ydoc.getXmlFragment(name);
    case "codemirror":
      return ydoc.getText(name);
    case "meta":
    default:
      return ydoc.getMap(name);
  }
}
