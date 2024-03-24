import * as Y from "yjs";

export function resolveShare(ydoc: Y.Doc, name: string) {
  switch (name) {
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
