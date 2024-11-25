import { useContext } from "react";
import { useNavigate, UNSAFE_NavigationContext as NavigationContext } from "react-router-dom";

export function useNavigateMaybe() {
  const context = useContext(NavigationContext);
  const isInsideRouter = !!context;
  return isInsideRouter ? useNavigate() : null;
}
