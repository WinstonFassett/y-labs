import { nanosubscriber } from "./subscribe";

export function makeMultiHandler(room: any, methodName: string) {
  const origEventMethod = room[methodName];
  const [listen, emit] = nanosubscriber();
  room[methodName](emit);
  room[methodName] = listen;
  return () => {
    room[methodName] = origEventMethod;
  };
}
