
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import Editor from "./TlDrawEditorApp";

export function EditorRoute() {
  useDocRoomRoute()
  return <Editor className="h-screen" />;
}
