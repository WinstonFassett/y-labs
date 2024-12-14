import { atom, type WritableAtom } from "nanostores";

export function addToggling(store: WritableAtom<boolean>) {
  function toggle() {
    store.set(!store.get());
  }
  return Object.assign(store, { toggle });
}
export function toggleStore(val?: boolean) {
  return addToggling(atom(val));
}
