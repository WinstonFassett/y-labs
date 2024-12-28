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
): (id: string, ...args: A) => S {
  
  
  const cacheStore = map<Record<string, S>>();
  const mountedStore = map<Record<string, S>>();
  
  let Template: any = (id: string, ...args: A) => {
    let cachedValue = cacheStore.get()[id]
    if (!cachedValue) {
      console.log('building', id)
      const item = Template.build(id, ...args)
      // cacheStore.setKey(id, item);
      console.log('checking', 
        !cachedValue || cachedValue === item,
        cacheStore.value === cacheStore.value
      )
      cacheStore.setKey(id, item);
      cachedValue = item
      console.log('cached', id, item)
      // cacheStore.notify(cacheStore.value)
    }
    return cachedValue;
  };  
  Template.$cache = cacheStore
  console.log('checking 1',     
    cacheStore.value === cacheStore.value
  )

  Template.build = (id: string, ...args: A) => {
    let store = build?.(id, ...args) ?? (map({ id }) as S);
    onMount(store, () => {
      let destroy: (() => void) | undefined;
      if (mount) destroy = mount(store, id, ...args);
      return () => {
        // delete cacheStore.value[id];
        cacheStore.setKey(id, undefined as any);
        if (destroy) destroy();
      };
    });
    return store;
  };

  Template.evict = (id: string) => {
    const it = cacheStore.value[id];
    delete cacheStore.value[id];
    console.log("evicted", id, it);
  };

  // const model = Object.assign(Template, {    
  //   $cache: cacheStore,
  // })

  return Template;
}
