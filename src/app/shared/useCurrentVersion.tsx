import { useDocCollabStore } from "@/app/shared/useDocCollabStore";
import { useParams } from "react-router-dom";
import { useDocEditorMode } from "./useDocEditorMode";
import { useStoreIfPresent } from "./useStoreIfPresent";
import { useVersionHistory } from "./useVersionHistory";
import { useMemo } from "react";

export function useCurrentVersion() {
  const { docId, ydoc } = useDocCollabStore();
  const { type } = useParams<{ docId: string; type: string; }>();

  const { $versionHistory, displayVersionId } = useVersionHistory();

  const isLatestVersion = useStoreIfPresent(
    $versionHistory?.$isLatestVersion
  ) ?? false;

  const mode = useDocEditorMode();

  const isVersionReplay = mode === 'versions' && !!displayVersionId && !isLatestVersion;

  const replayDoc = useStoreIfPresent(
    isVersionReplay &&
    $versionHistory?.$replayDoc
  );

  const isLive = !isVersionReplay;

  const isReplay = !isLive && !!displayVersionId;
  const docToUse = isReplay ? replayDoc : ydoc;
  const versionKey = useMemo(() => (isReplay ? displayVersionId : "current"), 
  [displayVersionId, isReplay]);
  
  return { docId, type, ydoc, currentDoc: docToUse, isReplay, replayDoc, versionId: displayVersionId, versionKey, isLatestVersion, isLive };
}
