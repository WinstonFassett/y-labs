import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDocVersionsStoreByDocEditor } from "./store/doc-versions";
import { useDocEditorMode } from "./useDocEditorMode";
import { useStoreIfPresent } from "./useStoreIfPresent";
import { useDocParams } from "./useDocParams";
import { useStore } from "@nanostores/react";
import { $trackHistoryWhenEditing } from "./store/local-settings";

export function useVersionHistory(options: {type?: string}={}) {
  const navigate = useNavigate();
  const { docId, type } = useDocParams({ type: options.type });
  const mode = useDocEditorMode();
  const showVersionHistory = !!docId && mode === 'versions';
  const canShowVersionHistory = !!docId
  const trackHistoryWhenEditing = useStore($trackHistoryWhenEditing)
  const $versionHistory = docId ? getDocVersionsStoreByDocEditor(docId, type) : undefined;
  const versionHistoryState = useStoreIfPresent($versionHistory);
  const displayVersionId = versionHistoryState?.displayVersionId;
  const versions = useStoreIfPresent($versionHistory?.$versions) ?? [];
  const currentVersionId =   displayVersionId ?? versions[versions.length-1]?.id 

  const setShowVersionHistory = (shouldShowVersionHistory: boolean) => {
    if (!canShowVersionHistory) {
      console.warn('Cannot show version history without a docId')
      return
    }
    navigate({
      pathname: shouldShowVersionHistory
        ? `/versions/${docId}/${type}`
        : `/edit/${docId}/${type}`,
      search: location.search,
    });
  };
  const toggleVersionHistory = useCallback(() => {
    setShowVersionHistory(!showVersionHistory);
  }, [showVersionHistory, setShowVersionHistory]);

  return { docId, type, $versionHistory, displayVersionId, currentVersionId, toggleVersionHistory, showVersionHistory, canShowVersionHistory, setShowVersionHistory, trackHistoryWhenEditing };
}
