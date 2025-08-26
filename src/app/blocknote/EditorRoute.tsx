
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import { LazyEditor } from "./lazy/editor";

export function EditorRoute() {
  useDocRoomRoute()
  return <LazyEditor />;
}
