import { useDocCollabStore } from "@/app/shared/useDocCollabStore";
import { $docMetas } from "./store/local-docs-metadata";
import { getBaseShares } from "./shares-base";

export function useDocTitle() {
  const { docId, ydoc } = useDocCollabStore();
  const info = $docMetas.get()?.find((x) => x.id === docId);
  const setTitle = title => {
    const { meta } = getBaseShares(ydoc);
    meta.set("title", title);
  };
  return [info?.title, setTitle];
}
