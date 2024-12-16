
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import Editor from "./MilkdownEditor";

export function EditorRoute() {
  useDocRoomRoute()
  return <Editor />;
}
