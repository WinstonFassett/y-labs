import { computed, type MapStore } from "nanostores";

export type AllKeys<T> = T extends any ? keyof T : never;
type KeyofBase = keyof any;
export type Get<T, K extends KeyofBase> = Extract<
  T,
  {
    [K1 in K]: any;
  }
>[K];

/**
 * Only updates if the value changes
 * @param store
 * @param key
 * @returns
 */
export function storeKey<
  S extends MapStore<any>,
  T extends ReturnType<S["get"]>,
  K extends keyof T,
>(store: S, key: K) {
  const field = computed(store, (state) => state[key]);
  return Object.assign(field, {
    update: (value: T[K]) => {
      store.setKey(key, value);
    },
  });
}
