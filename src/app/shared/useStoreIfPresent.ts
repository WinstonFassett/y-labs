import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { atom, type ReadableAtom } from "nanostores";

export function useStoreIfPresent<T>(store: ReadableAtom<T> | undefined) {
  const wrapper = useMemo(() => {
    return store || atom<T>();
  }, [store]);
  return useStore(wrapper);
}
