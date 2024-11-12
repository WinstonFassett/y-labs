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
  // const [searchParams, setSearchParams] = useSearchParams();
  // const encrypt = searchParams.get("encrypt") === "true";
  // console.log('encrypt', encrypt);
  const navigate = useNavigate();
  const $latestRoomConfig = useStore(roomConfigsByDocId)[docId];
  // const [searchParams, setSearchParams] = useSearchParams();
  // const roomId = searchParams.get("roomId") ?? undefined;
  const latestRoomConfig = useStoreIfPresent($latestRoomConfig);
  const roomId = latestRoomConfig?.roomId;
  const { $ydoc, $room, $roomConfig, startSharing, stopSharing } =
    useMemo(() => {
      const $ydoc = getYdoc(docId!);
      const $room = roomId && getTrysteroDocRoom(docId!, roomId);
      const $roomConfig = roomId && getDocRoomConfig(docId!, roomId);

      function startSharing(config: typeof latestRoomConfig) {
        const { roomId } = config;
        const docRoomId = getDocRoomId(docId, roomId);
        // console.log("startSharing", roomId, docRoomId, config);
        const $roomConfig = getDocRoomConfig(docId, roomId);
        $roomConfig.set({ ...$roomConfig.get(), ...config, enabled: true });
        roomConfigsByDocId.setKey(docId, $roomConfig);
        navigate(`?roomId=${roomId}`);        
      }
      function stopSharing() {
        if ($roomConfig) {
          $roomConfig.setKey("enabled", false);
          $room?.disconnect();
          navigate(`?roomId=`);
        }
      }

      return { $ydoc, $room, $roomConfig, startSharing, stopSharing };
    }, [docId, roomId, $latestRoomConfig]);
  const password = latestRoomConfig?.password;
  console.log({ docId, roomId, latestRoomConfig, password });
  const sharingLink = useMemo(() => {
    return [
      window.location.protocol,
      "//",
      window.location.host,
      window.location.pathname,
      "#/edit/",
      docId,
      "?roomId=",
      roomId,
      password ? `&x=${password}` : "",
    ].join("");
  }, [docId, roomId, password]);
  const ydoc = useStore($ydoc);

  return {
    ydoc,
    docId,
    roomId,
    $room,
    $roomConfig,
    startSharing,
    stopSharing,
    sharingLink,
  };
}
