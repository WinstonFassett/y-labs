import { mapTemplate } from "@/lib/nanostores-utils/mapTemplate";
import { atom } from "nanostores";
import { Doc } from "yjs";

const ydocsT = mapTemplate(
  (id) =>
    Object.assign(atom(new Doc()), {
      $loaded: atom(false),
    }),
  (store, id) => {
    // console.log("new ydoc", id);
    const ydoc = new Doc();
    ydoc.gc = false;
    const onLoad = () => {
      store.$loaded.set(true);
    };
    ydoc.once("load", onLoad);
    store.set(ydoc);
    return () => {
      ydoc.off("load", onLoad);
      console.log("done with ydoc", id, store, ydoc);
      ydoc.destroy();
    };
  },
);

export function getYdoc(id: string) {
  const ydoc = ydocsT(id);
  return ydoc;
}
