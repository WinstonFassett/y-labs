import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getYdoc } from "./yjs-docs";
import { roomKeys } from "./doc-room-keys";
import { getTrysteroDocRoom } from "./trystero-doc-room";
import { useCallback, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { useStoreIfPresent } from "../useStoreIfPresent";
import { getDocRoomConfig } from "./doc-room-config";


export function useDocRoute(required = true) {
  const { docId } = useParams<{ docId: string }>()
  if (required && !docId) {
    throw new Error("docId is required")
  }
  const docRouteDocId = docId!
  const $ydoc = getYdoc(docRouteDocId)
  const ydoc = $ydoc.get()
  return { docId: docRouteDocId, ydoc }
}

export function useDocEditorRoute(required = true) {
  const { docId, ydoc } = useDocRoute(required)
  const { type } = useParams<{ type: string }>()
  return { docId, ydoc, type }
}

const PASSWORD_URL_PARAM = "x"

export function useRoomRoute(required = true) {  
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const roomId = searchParams.get("roomId")
  const hasRoomId = !!roomId
  if (required && !hasRoomId) {
    throw new Error("roomId is required")
  }
  const passwordParam = searchParams.get(PASSWORD_URL_PARAM)

  if (passwordParam) {
    searchParams.delete(PASSWORD_URL_PARAM)
    searchParams.set("encrypt", "true")
    setSearchParams(searchParams)
  }

  if (hasRoomId) {
    const encrypt = !!passwordParam || searchParams.get("encrypt") === "true" 
    const hasPassword = !!roomKeys.value?.[roomId]
    const needsPasswordToConnect = encrypt && !hasPassword
    const canConnectToRoom = !needsPasswordToConnect
    return { roomId, roomParams: {
      encrypt, needsPasswordToConnect, canConnectToRoom 
    }}
  }
  return {
    roomId: null,
    roomParams: null
  }
  // // const needsPasswordToConnect = encrypt && !password
  // // const canConnectToRoom = roomId && !needsPasswordToConnect

  // return { 
  //   roomId, 
  // }

}

export function useDocRoomRouteParams(required = true) {
  const { docId, ydoc, type } = useDocEditorRoute(required)
  const { roomId, roomParams } = useRoomRoute(required)
  return useMemo(() => {
    return {
      docId,
      ydoc,
      type,
      roomId,
      roomParams
    }
  }
  , [docId, ydoc, type, roomId, roomParams])
}

export function useDocCollabRoute(required = true) {
  const routeParams = useDocRoomRouteParams(required)
  const { docId, ydoc, type, roomId, roomParams } = routeParams
  const $room = useMemo(() => {
    if (roomId && roomParams) {
      const { canConnectToRoom } = roomParams
      if (canConnectToRoom) {
        const $room = getTrysteroDocRoom(docId, roomId)
        return $room
      }
    }    
  }, [roomId, routeParams])
  return {
    routeParams,
    $room
  }
}

export function useDocRoomConfig(required = true) {
  // const { routeParams, $room } = useDocCollabRoute(required)
  const {
    docId,
    ydoc,
    type,
    roomId,
    roomParams
  } = useDocRoomRouteParams(required)
  const $config = !!roomId ? getDocRoomConfig(docId, roomId): undefined
  const config = useStoreIfPresent($config)
  // const updateConfig = $config?.set
  return { docId, ydoc, type, roomId, roomParams, $config, config }
}

export function useDocRoom(required = true) {
  const { routeParams, $room } = useDocCollabRoute(required)
  const roomState = useStoreIfPresent($room) // magic
  return { routeParams, $room, roomState}
}