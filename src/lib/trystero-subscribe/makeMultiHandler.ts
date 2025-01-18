import { nanoevent } from "../nanoevent";

export function makeMultiHandler(room: any, methodName: string) {
  const origEventMethod = room[methodName];
  const [listen, emit] = nanoevent();
  room[methodName](emit);
  room[methodName] = listen;
  return () => {
    room[methodName] = origEventMethod;
  };
}
