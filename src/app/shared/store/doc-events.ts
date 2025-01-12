import type { TrysteroDocRoom, TrysteroProvider } from "@/lib/yjs-trystero/y-trystero";
import EventEmitter from "events";
import type TypedEmitter from 'typed-emitter';
import type { DocRoomStore } from "./trystero-doc-room";

export type EventTypes = {
  joinedRoom: (ev: { 
    docId: string 
    roomId: string
    $room: DocRoomStore
    provider: TrysteroProvider
  }) => void;
  leftRoom: (ev: { 
    docId: string
    roomId: string
    $room: DocRoomStore
    provider: TrysteroProvider
  }) => void;
}

export const DocEvents = new EventEmitter() as TypedEmitter<EventTypes>

