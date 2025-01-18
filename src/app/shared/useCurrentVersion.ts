import { useDocCollabStore } from "@/app/shared/useDocCollabStore";
import { useMemo } from "react";
import { useDocEditorMode } from "./useDocEditorMode";
import { useDocParams } from "./useDocParams";
import { useStoreIfPresent } from "./useStoreIfPresent";
import { useVersionHistory } from "./useVersionHistory";

export function useCurrentVersion(options: { type?: string } = {}) {
  const { type, docId } = useDocParams({ type: options.type });
  const { ydoc } = useDocCollabStore();
  const { $versionHistory, displayVersionId } = useVersionHistory({ type });
  const isLatestVersion =
    useStoreIfPresent($versionHistory?.$isLatestVersion) ?? false;
  const mode = useDocEditorMode();
  const isVersionReplay =
    mode === "versions" && !!displayVersionId && !isLatestVersion;
  const replayDoc = useStoreIfPresent(
    isVersionReplay ? $versionHistory?.$replayDoc : undefined,
  );
  const isLive = !isVersionReplay;
  const isReplay = !isLive && !!displayVersionId;
  const docToUse = isReplay ? replayDoc : ydoc;
  const versionKey = useMemo(
    () => (isReplay ? displayVersionId : "current"),
    [displayVersionId, isReplay],
  );
  return {
    docId,
    type,
    ydoc,
    currentDoc: docToUse,
    isReplay,
    replayDoc,
    versionId: displayVersionId,
    versionKey,
    isLatestVersion,
    isLive,
  };
}
