import { makeMultiHandler } from "@/lib/trystero-subscribe/makeMultiHandler.js";
import { joinRoom } from "trystero";
import { appId } from "./store/constants";

export function createRoom(roomId: string) {
  const config = { appId };
  const room = joinRoom(config, roomId);
  ["onPeerJoin", "onPeerLeave", "onPeerStream", "onPeerTrack"].forEach(
    (methodName) => makeMultiHandler(room, methodName),
  );
  return room;
}
