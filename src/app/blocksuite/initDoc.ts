import { Doc, Text } from "@blocksuite/store";

export function initDoc(doc: Doc) {
  doc.load(() => {
    if (doc.isEmpty) {
      const rootId = doc.addBlock("affine:page", {
        title: new Text(),
      });
      doc.addBlock("affine:surface", {}, rootId);
    }
  });
}
