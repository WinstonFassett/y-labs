import { useStore } from "@nanostores/react";
import { useSearchParams } from "react-router-dom";
import { getTrysteroDocRoom } from "./store/trystero-doc-room";
import { getYdoc } from "./store/yjs-docs";
import { useDocParams } from "../blocknote/Editor";
import { getDocRoomConfig, roomConfigsByDocId } from "./store/doc-room-config";
import { useMemo } from "react";
import { useStoreIfPresent } from "./useStoreIfPresent";

/**
 * Uses search params to determine: docId, roomId,
 * and uses that to get the ydoc, room, and roomConfig
 * Currently there is an issue with
 *
 * @returns
 */
export function useDocCollabStore() {
  const { docId } = useDocParams();
  if (!docId) {
    throw new Error("No document id specified");
  }
  const $latestRoomConfig = useStore(roomConfigsByDocId)[docId];
  console.log("$latestRoomConfig", $latestRoomConfig);
  // const latestRoomConfig = useStoreIfPresent($latestRoomConfig);
  const [searchParams, setSearchParams] = useSearchParams();
  // const roomId = searchParams.get("roomId") ?? undefined;
  const latestRoomConfig = useStoreIfPresent($latestRoomConfig);
  const roomId = latestRoomConfig?.roomId;
  console.log({ roomId, latestRoomConfig });
  // const roomId = latestRoomConfig?.get()?.roomId;
  const { $ydoc, $room, $roomConfig } = useMemo(() => {
    const $ydoc = getYdoc(docId!);
    const $room = roomId && getTrysteroDocRoom(docId!, roomId);
    const $roomConfig = roomId && getDocRoomConfig(docId!, roomId);
    console.log("got stuff", { $ydoc, $room, $roomConfig });
    return { $ydoc, $room, $roomConfig };
  }, [docId, roomId, latestRoomConfig]);
  const ydoc = useStore($ydoc);

  return { ydoc, docId, roomId, $room, $roomConfig };
}
