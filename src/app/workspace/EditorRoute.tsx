
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import { Workspace } from "./Workspace";

export function EditorRoute({mode}: {mode?: string}) {
  useDocRoomRoute()
  return <Workspace mode={mode} />
}
