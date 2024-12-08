import { getDocLoadState } from "@/app/shared/store/doc-loader";
import { useDocCollabStore } from "@/app/shared/useDocCollabStore";
import { useStore } from "@nanostores/react";
import { useDocEditorMode } from "./useDocEditorMode";
import { useCurrentVersion } from "./useCurrentVersion";
import { getSharesForType } from "./shares-lookup";
import { useMemo } from "react";
import { useDocTitle } from "./useDocTitle";

export function useDocEditor() {
  const collabStuff = useDocCollabStore();
  const currentVersionStuff = useCurrentVersion();
  const { docId, ydoc, type, versionKey, isReplay } = currentVersionStuff;
  const { roomId, docRoomId } = collabStuff;
  const mode = useDocEditorMode();
  const loadState = useStore(getDocLoadState(docId, roomId));
  const shares = useMemo(() => getSharesForType(ydoc, type), [type]);

  const loaded = loadState === "loaded";
  const title = useDocTitle();
  const autofocusDoc = loaded && !!title;
  const docEditorKey = [docRoomId, versionKey].join(":");
  const readOnly = isReplay
  return {
    ...collabStuff,
    ...currentVersionStuff,
    mode,
    loadState,
    shares,
    autofocusDoc,
    loaded,
    title,
    docEditorKey,
    readOnly
  };
}
