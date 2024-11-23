import { useStore } from "@nanostores/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDocParams } from "../blocknote/Editor";
import {
  getDocRoomConfig,
  getDocRoomId,
  type DocRoomConfigFields
} from "./store/doc-room-config";
import { getTrysteroDocRoom } from "./store/trystero-doc-room";
import { getYdoc } from "./store/yjs-docs";
import { useStoreIfPresent } from "./useStoreIfPresent";

export function useDocCollabStore() {
  const { docId } = useDocParams();
  if (!docId) {
    throw new Error("No document id specified");
  }
  const navigate = useNavigate();

  const $ydoc = getYdoc(docId!);
  const ydoc = useStore($ydoc);

  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const $roomConfig = roomId ? getDocRoomConfig(docId!, roomId) : undefined;
  const roomConfig = useStoreIfPresent($roomConfig);
  const $room = roomConfig?.enabled ? getTrysteroDocRoom(docId!, roomId) : undefined;

  function startSharing(config: DocRoomConfigFields) {
    const { roomId } = config;
    const $roomConfig = getDocRoomConfig(docId, roomId);
    $roomConfig.set({ ...$roomConfig.get(), ...config, enabled: true });
    const $room = getTrysteroDocRoom(docId, roomId);
    if ($room.room?.leftAt) {
      $room.reconnect();
    }
    console.log('got room', $room)
    navigate(`?roomId=${roomId}`);        
  }

  function stopSharing() {
    if ($roomConfig) {
      $roomConfig.setKey("enabled", false);
      $room?.disconnect();
      navigate(`?roomId=`);
    }
  }

  return {
    ydoc,
    docId,
    roomId,
    $room,
    $roomConfig,
    startSharing,
    stopSharing,
  };
}
