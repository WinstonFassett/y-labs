
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import Editor from "./Editor";

export function EditorRoute() {
  useDocRoomRoute()
  return <Editor className="h-full" />;
}
