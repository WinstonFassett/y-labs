import { useStore } from "@nanostores/react";
import { useSearchParams } from "react-router-dom";
import { getTrysteroDocRoom } from "./store/trystero-doc-room";
import { getYdoc } from "./store/yjs-docs";
import { useDocParams } from "../blocknote/Editor";
import { getDocRoomConfig } from "./store/doc-room-config";

export function useDocCollabStore() {
  const { docId } = useDocParams();
  if (!docId) {
    throw new Error("No document id specified");
  }
  const $ydoc = getYdoc(docId!);
  const ydoc = useStore($ydoc);

  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get("roomId") ?? undefined;

  const $room = roomId ? getTrysteroDocRoom(docId!, roomId) : undefined;
  const $roomConfig = roomId ? getDocRoomConfig(docId!, roomId) : undefined;
  return { ydoc, docId, roomId, $room, $roomConfig };
}
