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

export function useDocCollabStore(requireDocId = true) {
  const { docId } = useDocParams();
  if (!docId) {
    if (requireDocId) {
      throw new Error("No document id specified");
    }
    return {  };
  }
  const navigate = useNavigate();

  const $ydoc = getYdoc(docId!);
  const ydoc = useStore($ydoc);

  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const $roomConfig = roomId ? getDocRoomConfig(docId!, roomId) : undefined;
  const roomConfig = useStoreIfPresent($roomConfig);

  // check if encrypt without password
  const needsPasswordToConnect = roomConfig?.encrypt && !roomConfig.password
  const canConnect = roomConfig?.enabled && !needsPasswordToConnect
  const $room = canConnect ? getTrysteroDocRoom(docId!, roomId) : undefined;

  function startSharing(config: DocRoomConfigFields) {
    const { roomId } = config;
    const $roomConfig = getDocRoomConfig(docId, roomId);
    $roomConfig.set({ ...$roomConfig.get(), ...config, enabled: true });
    const $room = getTrysteroDocRoom(docId, roomId);
    if ($room.room?.leftAt) {
      $room.reconnect();
    }
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
    needsPasswordToConnect,
  };
}
