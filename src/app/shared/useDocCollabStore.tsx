import { useStore } from "@nanostores/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTrysteroDocRoom } from "./store/trystero-doc-room";
import { getYdoc } from "./store/yjs-docs";
import { useDocParams } from "../blocknote/Editor";
import {
  getDocRoomConfig,
  getDocRoomId,
  roomConfigsByDocId,
} from "./store/doc-room-config";
import { useMemo } from "react";
import { useStoreIfPresent } from "./useStoreIfPresent";

export function useDocCollabStore() {
  const { docId } = useDocParams();
  if (!docId) {
    throw new Error("No document id specified");
  }
  const navigate = useNavigate();
  const $latestRoomConfig = useStore(roomConfigsByDocId)[docId];
  const latestRoomConfig = useStoreIfPresent($latestRoomConfig);
  const roomId = latestRoomConfig?.roomId;
  const { $ydoc, $room, $roomConfig, startSharing, stopSharing } =
    useMemo(() => {
      const $ydoc = getYdoc(docId!);
      let $room = roomId ? getTrysteroDocRoom(docId!, roomId) : undefined;
      const $roomConfig = roomId ? getDocRoomConfig(docId!, roomId) : undefined;

      function startSharing(config: typeof latestRoomConfig) {
        const { roomId } = config;
        const docRoomId = getDocRoomId(docId, roomId);
        const $roomConfig = getDocRoomConfig(docId, roomId);
        $roomConfig.set({ ...$roomConfig.get(), ...config, enabled: true });
        roomConfigsByDocId.setKey(docId, $roomConfig);
        // console.log('ensure doc room')
        // if reconnect, provider was destroyed
        $room = getTrysteroDocRoom(docId, roomId);
        // console.log('start sharing in room', $room)
        if ($room.room?.leftAt) {
          // console.log('need to reconnect!')
          $room.reconnect();
        }
        navigate(`?roomId=${roomId}`);        
      }

      function stopSharing() {
        console.log('stopSharing')
        if ($roomConfig) {
          $roomConfig.setKey("enabled", false);
          console.log('disconnecting', {$room})
          $room?.disconnect();
          navigate(`?roomId=`);
        }
      }

      return { $ydoc, $room, $roomConfig, startSharing, stopSharing };
    }, [docId, roomId, $latestRoomConfig]);
  const password = latestRoomConfig?.password;
  const ydoc = useStore($ydoc);

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
