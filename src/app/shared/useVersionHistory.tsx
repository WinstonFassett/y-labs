import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDocVersionsStoreByDocEditor } from "./store/doc-versions";
import { useDocEditorMode } from "./useDocEditorMode";
import { useStoreIfPresent } from "./useStoreIfPresent";

export function useVersionHistory() {
  const navigate = useNavigate();
  const { docId, type } = useParams<{ docId: string; type: string; }>();  
  const mode = useDocEditorMode();
  const showVersionHistory = !!docId && mode === 'versions';
  const canShowVersionHistory = !!docId

  const $versionHistory = docId ? getDocVersionsStoreByDocEditor(docId, type) : undefined;
  const { displayVersionId } = useStoreIfPresent($versionHistory);
  const versions = useStoreIfPresent($versionHistory?.$versions) ?? [];
  const currentVersionId =   displayVersionId ?? versions[versions.length-1]?.id 

  const setShowVersionHistory = (shouldShowVersionHistory: boolean) => {
    if (!canShowVersionHistory) {
      console.warn('Cannot show version history without a docId')
      return
    }
    console.log('setShowVersionHistory', shouldShowVersionHistory)
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

  return { docId, type, $versionHistory, displayVersionId, currentVersionId, toggleVersionHistory, showVersionHistory, canShowVersionHistory, setShowVersionHistory };
}
