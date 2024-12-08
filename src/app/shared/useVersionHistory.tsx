import { useNavigate, useParams } from "react-router-dom";
import { useDocEditorMode } from "./useDocEditorMode";
import { useCallback } from "react";
import { getDocVersionsStoreByDocEditor } from "./store/doc-versions";
import { useStoreIfPresent } from "./useStoreIfPresent";

export function useVersionHistory() {
  const navigate = useNavigate();
  const { docId, type } = useParams<{ docId: string; type: string; }>();  
  const mode = useDocEditorMode();
  const showVersionHistory = !!docId && mode === 'versions';
  const canShowVersionHistory = !!docId

  const $versionHistory = docId ? getDocVersionsStoreByDocEditor(docId, type) : undefined;
  const versionHistory = useStoreIfPresent($versionHistory);

  const setShowVersionHistory = (shouldShowVersionHistory: boolean) => {
    if (!canShowVersionHistory) {
      console.warn('Cannot show version history without a docId')
      return
    }
    console.log('setShowVersionHistory', shouldShowVersionHistory)
    navigate({
      pathname: shouldShowVersionHistory
        ? 
        `/versions/${docId}/${type}`
        : 
        `/edit/${docId}/${type}`
        ,
      search: location.search,
    });
  };
  const toggleVersionHistory = useCallback(() => {
    setShowVersionHistory(!showVersionHistory);
  }, [showVersionHistory, setShowVersionHistory]);

  return { docId, type, $versionHistory, versionHistory, toggleVersionHistory, showVersionHistory, canShowVersionHistory, setShowVersionHistory };
}
