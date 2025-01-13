import mitt from 'mitt';
import type { TrysteroDocRoom, TrysteroProvider } from "@/lib/yjs-trystero/y-trystero";
import type TypedEmitter from 'typed-emitter';
import type { DocRoomStore } from "./trystero-doc-room";

export type DocEventTypes = {
  joinedRoom:  { 
    docId: string 
    roomId: string
    $room: DocRoomStore
    provider: TrysteroProvider
  }
  leftRoom:  { 
    docId: string
    roomId: string
    $room: DocRoomStore
    provider: TrysteroProvider
  }
}

export const DocEvents = mitt<DocEventTypes>()

