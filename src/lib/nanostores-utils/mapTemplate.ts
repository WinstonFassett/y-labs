import {
  type MapStore,
  type MapCreator,
  map,
  onMount,
  clean,
  type Store,
} from "nanostores";

export function mapTemplate<
  S extends Store<T>,
  T = any,
  A extends any[] = any[],
>(
  build?: (id: string, ...args: A) => S,
  mount?: (store: S, id: string, ...args: A) => (() => void) | undefined,
): ((id: string, ...args: A) => S) & { $cache: MapStore<Record<string, S>> } {
  
  
  const cacheStore = map<Record<string, S>>();
  // const mountedStore = map<Record<string, S>>();
  
  let Template: any = (id: string, ...args: A) => {
    let cachedValue = cacheStore.get()[id]
    if (!cachedValue) {
      const item = Template.build(id, ...args)
      cacheStore.setKey(id, item);
      cachedValue = item
    }
    return cachedValue;
  };
  
  Template.$cache = cacheStore

  Template.build = (id: string, ...args: A) => {
    let store = build?.(id, ...args) ?? (map({ id }) as S);
    onMount(store, () => {
      let destroy: (() => void) | undefined;
      if (mount) destroy = mount(store, id, ...args);
      return () => {
        cacheStore.setKey(id, undefined as any);
        if (destroy) destroy();
      };
    });
    return store;
  };

  Template.evict = (id: string) => {    
    cacheStore.setKey(id, undefined as any);
  };

  return Template;
}
