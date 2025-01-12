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
  let Template: any = (id: string, ...args: A) => {
    if (!Template.cache[id]) {
      Template.cache[id] = Template.build(id, ...args);
    }
    return Template.cache[id];
  };

  Template.build = (id: string, ...args: A) => {
    let store = build?.(id, ...args) ?? (map({ id }) as S);
    onMount(store, () => {
      let destroy: (() => void) | undefined;
      if (mount) destroy = mount(store, id, ...args);
      return () => {
        delete Template.cache[id];
        if (destroy) destroy();
      };
    });
    return store;
  };

  Template.evict = (id: string) => {
    const it = Template.cache[id];
    delete Template.cache[id];
    // console.log("evicted", id, it);
  };

  Template.cache = {} as Record<string, S>;

  return Template;
}
