
import Editor from "./RemirrorEditor";
import { useDocRoomRoute } from "../shared/useDocRoomRoute";
import AppBar from "../shared/AppBar";

export function EditorRoute() {
  useDocRoomRoute();
  return <>
    <AppBar />
    <Editor />
  </>;
}

