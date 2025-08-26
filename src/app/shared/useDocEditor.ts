import { getDocLoadState } from "@/app/shared/store/doc-loader";
import { useDocCollabStore } from "@/app/shared/useDocCollabStore";
import { useStore } from "@nanostores/react";
import { useDocEditorMode } from "./useDocEditorMode";
import { useCurrentVersion } from "./useCurrentVersion";
import { getSharesForType } from "./config/shares-lookup";
import { useMemo } from "react";
import { useDocTitle } from "./useDocTitle";
import { useDocParams } from "./useDocParams";

export function useDocEditor(options: {type?: string}={}) {
  const { docId, type } = useDocParams({ type: options.type });
  const docCollab = useDocCollabStore();
  const docVersioning = useCurrentVersion({ type });
  const { ydoc, versionKey, isReplay } = docVersioning;
  const { roomId, docRoomId } = docCollab;
  const mode = useDocEditorMode();
  const loadState = useStore(getDocLoadState(docId!, roomId));
  const shares = useMemo(() => getSharesForType(ydoc, type!), [type]);

  const loaded = loadState === "loaded";
  const title = useDocTitle();
  const autofocusDoc = loaded && !!title;
  const docEditorKey = [docRoomId, versionKey].join(":");
  const readOnly = isReplay
  return {
    ...docCollab,
    ...docVersioning,
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
