import { useStore } from "@nanostores/react";
import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getDocRoomConfig,
  type DocRoomConfigFields
} from "./store/doc-room-config";
import { getTrysteroDocRoom } from "./store/trystero-doc-room";
import { getYdoc } from "./store/yjs-docs";

export function useDocCollabStore(requireDocId = true) {
  const { docId } = useParams();
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

  const { $roomConfig, $room } = useMemo(() => {
    const $roomConfig = roomId ? getDocRoomConfig(docId!, roomId) : undefined;
    const $room = roomId ? getTrysteroDocRoom(docId, roomId) : undefined
    return { $roomConfig, $room}
  }, [docId, roomId])


  function startSharing(config: DocRoomConfigFields) {
    console.log('start sharing', config)
    const roomId = config.roomId;
    const $roomConfig = getDocRoomConfig(docId!, roomId);
    $roomConfig?.set({ ...$roomConfig.get(), ...config, enabled: true });
    console.log('started sharing!')
  }

  function stopSharing() {
    if ($roomConfig) {
      $roomConfig.stopSharing
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
