
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import { Workspace } from "./Workspace";

export function EditorRoute() {
  useDocRoomRoute()
  return <Workspace />
}
