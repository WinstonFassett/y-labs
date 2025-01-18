import { useStore } from "@nanostores/react";
import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getDocRoomConfig,
  type DocRoomConfigFields,
  getDocRoomId
} from "./store/doc-room-config";
import { getTrysteroDocRoom } from "./store/doc-room-trystero";
import { getYdoc } from "./store/doc-yjs";
import { useStoreIfPresent } from "./useStoreIfPresent";

export function useDocCollabStore(requireDocId = true) {
  const { docId } = useParams();
  if (!docId) {
    if (requireDocId) {
      throw new Error("No document id specified");
    }
  }
  const navigate = useNavigate();

  const $ydoc = docId ? getYdoc(docId!) : undefined;
  const ydoc = useStoreIfPresent($ydoc);
  
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const { $roomConfig, $room } = useMemo(() => {
    const $roomConfig = roomId ? getDocRoomConfig(docId!, roomId) : undefined;
    const $room = roomId ? getTrysteroDocRoom(docId, roomId) : undefined
    return { $roomConfig, $room}
  }, [docId, roomId])

  const room = useStoreIfPresent($room);
  function startSharing(config: DocRoomConfigFields) {
    const roomId = config.roomId;
    const $roomConfig = getDocRoomConfig(docId!, roomId);
    $roomConfig?.set({ ...$roomConfig.get(), ...config, enabled: true });
  }

  function stopSharing() {
    if ($roomConfig) {
      $roomConfig.stopSharing()
      navigate(`?roomId=`);
    }
  }
  const { needsPasswordToConnect, canConnect } = useStoreIfPresent($roomConfig?.$validation) ?? {};

  const docRoomId = getDocRoomId(docId, roomId);

  return {
    ydoc,
    docId,
    roomId,
    docRoomId,
    $room,
    room,
    provider: room?.provider,
    $roomConfig,
    canConnect,
    needsPasswordToConnect,
    startSharing,
    stopSharing,
  };  
}


