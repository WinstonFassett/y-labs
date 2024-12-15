
import AppBar from "../shared/AppBar";
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import BlocksuiteEditor from './BlocksuiteEditor'

export function EditorRoute() {
  useDocRoomRoute()
  return <>
    <div className="h-full flex flex-col">
      <AppBar />
      <BlocksuiteEditor />
    </div>
  </>
}
