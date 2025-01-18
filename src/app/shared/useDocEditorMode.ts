import { useLocation } from "react-router-dom";

export function useDocEditorMode() {
  const location = useLocation();
  return location.pathname.includes('versions') ? 'versions' : 'edit';
}
