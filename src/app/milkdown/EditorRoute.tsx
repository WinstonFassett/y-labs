
import AppBar from "../shared/AppBar";
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import Editor from "./MilkdownEditor";

export function EditorRoute() {
  useDocRoomRoute()
  return <div className="flex-1 flex flex-col">
    <AppBar />
    <Editor />    
  </div>;
}
