import { useLocation } from "react-router-dom";


export function useDocEditorMode() {
  const location = useLocation();
  const isVersions = location.pathname.includes('versions');
  return isVersions ? 'versions' : 'edit';
}
