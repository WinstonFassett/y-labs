import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { atom } from "nanostores";
import { Doc } from "yjs";
import { getBlocksuiteDocStore } from "./blocksuite-docs";

const ydocsT = mapTemplate(
  (id) =>
    Object.assign(atom<Doc>(), {
      $loaded: atom(false),
    }),
  (store, id) => {
    const ydoc = new Doc();
    ydoc.gc = false;
    const onLoad = () => {
      store.$loaded.set(true);
    };
    ydoc.once("load", onLoad);
    store.set(ydoc);
    return () => {
      ydoc.off("load", onLoad);
      ydoc.destroy();
    };
  },
);

const blocksuiteYdocsT = mapTemplate(
  id => Object.assign(atom<Doc>(), { id }),
  (store, id) => {
    const $bsDoc = getBlocksuiteDocStore(id);
    return $bsDoc.subscribe((bsDoc) => {
      store.set(bsDoc.spaceDoc);
    })
  },
)

export function getYdoc(id: string) {
  if (id.startsWith("blocksuite-")) {
    return blocksuiteYdocsT(id);
  }
  const ydoc = ydocsT(id);
  return ydoc;
}
