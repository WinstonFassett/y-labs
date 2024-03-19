export type Listen<T> = (value: T) => void;
export type Subscribe<T> = (listener: Listen<T>) => Unsubscribe;
export type Unsubscribe = () => void;
export type Emit<T> = (value: T) => void;

export const nanosubscriber = <T>(
  listeners = [] as Listen<T>[],
): [Subscribe<T>, Emit<T>, Listen<T>[]] => [
  (listener: Listen<T>) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  (value: T) => {
    for (const listener of listeners) {
      listener(value);
    }
  },
  listeners,
];
