
import Editor from "./editor";
import { useDocRoomRoute } from "../shared/useDocRoomRoute";

export function EditorRoute() {
  useDocRoomRoute();
  return <Editor />;
}

