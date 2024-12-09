
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import Editor from "./TlDrawEditorApp";

export function EditorRoute() {
  useDocRoomRoute({ type: 'tldraw' });
  return <Editor className="h-screen" />;
}
