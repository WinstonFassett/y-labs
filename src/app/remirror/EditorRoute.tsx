
import Editor from "./RemirrorEditor";
import { useDocRoomRoute } from "../shared/useDocRoomRoute";

export function EditorRoute() {
  useDocRoomRoute();
  return <Editor />;
}

